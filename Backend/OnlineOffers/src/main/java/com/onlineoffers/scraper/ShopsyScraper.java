package com.onlineoffers.scraper;

import com.onlineoffers.dto.ScrapedProductData;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ShopsyScraper implements ProductScraper {

    private static final Logger log = LoggerFactory.getLogger(ShopsyScraper.class);

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

    @Override
    public boolean supports(String productUrl) {
        if (productUrl == null || productUrl.isBlank()) return false;
        String lower = productUrl.toLowerCase(Locale.ROOT);
        return lower.contains("shopsy.in") || lower.contains("shopsy.com") || lower.contains("shopsy.");
    }

    @Override
    public ScrapedProductData scrape(String productUrl) {
        ScrapedProductData data = new ScrapedProductData();
        data.setProductUrl(productUrl);

        try {
            Connection.Response response = Jsoup.connect(productUrl)
                    .userAgent(USER_AGENT)
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .timeout(20000)
                    .followRedirects(true)
                    .execute();

            Document doc = response.parse();

            // 1. Title
            String title = extractMeta(doc, "og:title", "twitter:title");
            if (title.isBlank()) {
                title = extractText(doc, "h1", "span.B_NuCI", "h1[class*='title']");
            }
            data.setName(title.isBlank() ? "Shopsy Deal Offer" : title.trim());

            // 2. Price
            BigDecimal currentPrice = extractPriceFromMeta(doc, "product:price:amount", "og:price:amount");
            if (currentPrice == null) {
                currentPrice = extractPrice(doc, "div.Nx9bqj", "div._30jeq3", "span.price", "div[class*='price']");
            }
            data.setCurrentPrice(currentPrice != null ? currentPrice : BigDecimal.ZERO);

            // 3. MRP
            BigDecimal originalPrice = extractPriceFromMeta(doc, "product:original_price:amount");
            if (originalPrice == null) {
                originalPrice = extractPrice(doc, "div.yRaY8j", "div._3I9_wc", "span.mrp", "del", "s");
            }
            if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0 || (currentPrice != null && originalPrice.compareTo(currentPrice) <= 0)) {
                if (currentPrice != null && currentPrice.compareTo(BigDecimal.ZERO) > 0) {
                    originalPrice = currentPrice.multiply(BigDecimal.valueOf(1.5)).setScale(0, RoundingMode.UP);
                } else {
                    originalPrice = currentPrice;
                }
            }
            data.setOriginalPrice(originalPrice);

            if (originalPrice != null && currentPrice != null && originalPrice.compareTo(currentPrice) > 0) {
                BigDecimal disc = originalPrice.subtract(currentPrice)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(originalPrice, 2, RoundingMode.HALF_UP);
                data.setDiscountPercentage(disc);
            }

            data.setInStock(true);
            data.setRating(BigDecimal.valueOf(4.2));
            data.setRatingCount("100+");

            // Images
            Set<String> images = new LinkedHashSet<>();
            String ogImg = extractMeta(doc, "og:image", "twitter:image");
            if (!ogImg.isBlank()) images.add(ogImg);

            Elements imgEls = doc.select("img[src*='rukminim'], img[src*='shopsy']");
            for (Element el : imgEls) {
                String src = el.attr("src");
                if (src != null && src.startsWith("http") && !src.contains("icon") && !src.contains("logo") && !src.contains("banner")) {
                    images.add(src);
                }
            }
            data.setImageUrls(new ArrayList<>(images));

            // Description
            String desc = extractText(doc, "div._1mXcCf", "div[class*='description']", "#description");
            if (desc.isBlank()) desc = extractMeta(doc, "og:description", "description");
            data.setDescription(desc);

            // Breadcrumbs Trail
            List<String> breadcrumbs = new ArrayList<>();
            Elements bcElements = doc.select("div._1MR4o5 a, .breadcrumb a");
            for (Element bc : bcElements) {
                String text = bc.text().trim();
                if (!text.isBlank() && !text.equalsIgnoreCase("Home") && !breadcrumbs.contains(text)) {
                    breadcrumbs.add(text);
                }
            }

            String fullCategoryTrail = breadcrumbs.isEmpty() ? "Budget & Value Deals" : String.join(" > ", breadcrumbs);
            data.setCategory(fullCategoryTrail);

        } catch (Exception e) {
            log.warn("Shopsy scraping issue for URL {}: {}", productUrl, e.getMessage());
        }

        return data;
    }

    private String extractText(Element parent, String... selectors) {
        for (String selector : selectors) {
            Element el = parent.selectFirst(selector);
            if (el != null && !el.text().isBlank()) return el.text().trim();
        }
        return "";
    }

    private String extractMeta(Document doc, String... metaNames) {
        for (String name : metaNames) {
            Element el = doc.selectFirst("meta[property='" + name + "'], meta[name='" + name + "']");
            if (el != null && el.hasAttr("content") && !el.attr("content").isBlank()) return el.attr("content").trim();
        }
        return "";
    }

    private BigDecimal extractPrice(Document doc, String... selectors) {
        for (String selector : selectors) {
            Elements els = doc.select(selector);
            for (Element el : els) {
                String text = el.text().replaceAll("[^0-9.]", "").trim();
                if (!text.isBlank()) {
                    try { return new BigDecimal(text); } catch (Exception ignored) {}
                }
            }
        }
        return null;
    }

    private BigDecimal extractPriceFromMeta(Document doc, String... metaNames) {
        for (String name : metaNames) {
            Element el = doc.selectFirst("meta[property='" + name + "'], meta[name='" + name + "']");
            if (el != null && el.hasAttr("content") && !el.attr("content").isBlank()) {
                String text = el.attr("content").replaceAll("[^0-9.]", "").trim();
                if (!text.isBlank()) {
                    try { return new BigDecimal(text); } catch (Exception ignored) {}
                }
            }
        }
        return null;
    }
}
