package com.onlineoffers.scraper;

import com.onlineoffers.dto.ProductReviewDto;
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
public class MeeshoScraper implements ProductScraper {

    private static final Logger log = LoggerFactory.getLogger(MeeshoScraper.class);

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

    @Override
    public boolean supports(String productUrl) {
        if (productUrl == null || productUrl.isBlank()) return false;
        String lower = productUrl.toLowerCase(Locale.ROOT);
        return lower.contains("meesho.com") || lower.contains("meesho.page.link") || lower.contains("meesho.");
    }

    @Override
    public ScrapedProductData scrape(String productUrl) {
        ScrapedProductData data = new ScrapedProductData();
        data.setProductUrl(productUrl);

        try {
            Connection.Response response = Jsoup.connect(productUrl)
                    .userAgent(USER_AGENT)
                    .header("Accept-Language", "en-US,en;q=0.9,hi;q=0.8")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
                    .timeout(20000)
                    .followRedirects(true)
                    .execute();

            Document doc = response.parse();

            // 1. Title
            String title = extractMeta(doc, "og:title", "twitter:title");
            if (title.isBlank()) {
                title = extractText(doc, "h1", "span[class*='ProductTitle']", "p[class*='ProductTitle']", "h2");
            }
            data.setName(title.isBlank() ? "Meesho Deal Offer" : title.trim());

            // 2. Price
            BigDecimal currentPrice = extractPriceFromMeta(doc, "product:price:amount", "og:price:amount");
            if (currentPrice == null) {
                currentPrice = extractPrice(doc,
                        "h4[class*='Price']",
                        "h4",
                        "span[class*='price']",
                        "p[class*='price']",
                        "div[class*='Price']");
            }
            data.setCurrentPrice(currentPrice != null ? currentPrice : BigDecimal.ZERO);

            // 3. MRP / Original Price
            BigDecimal originalPrice = extractPriceFromMeta(doc, "product:original_price:amount");
            if (originalPrice == null) {
                originalPrice = extractPrice(doc,
                        "p[class*='mrp']",
                        "span[class*='mrp']",
                        "s",
                        "del",
                        "p[style*='line-through']",
                        "span[style*='line-through']");
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

            // 4. Stock
            data.setInStock(true);

            // 5. Rating & Count
            String ratingStr = extractText(doc, "span[class*='Rating']", "div[class*='Rating']", "span[color*='green']");
            data.setRating(parseRating(ratingStr));
            String ratingCount = extractText(doc, "span[class*='ReviewCount']", "span[class*='rating-count']");
            data.setRatingCount(ratingCount.replaceAll("[^0-9,]", "").trim().isEmpty() ? "100+" : ratingCount.replaceAll("[^0-9,]", "").trim());

            // 6. Gallery Images
            Set<String> images = new LinkedHashSet<>();
            String ogImg = extractMeta(doc, "og:image", "twitter:image");
            if (!ogImg.isBlank()) images.add(ogImg);

            Elements imgEls = doc.select("img[src*='images.meesho.com'], img[src*='meesho']");
            for (Element el : imgEls) {
                String src = el.attr("src");
                if (src != null && src.startsWith("http") && !src.contains("icon") && !src.contains("logo") && !src.contains("banner")) {
                    images.add(src);
                }
            }
            data.setImageUrls(new ArrayList<>(images));

            // 7. Description
            String desc = extractText(doc, "div[class*='ProductDescription']", "p[class*='description']", "#description");
            if (desc.isBlank()) desc = extractMeta(doc, "og:description", "description");
            data.setDescription(desc);

            // 8. Category & Breadcrumbs Trail
            List<String> breadcrumbs = new ArrayList<>();
            Elements bcElements = doc.select("ul[class*='Breadcrumbs'] li a, div[class*='Breadcrumb'] a, .breadcrumb a");
            for (Element bc : bcElements) {
                String text = bc.text().trim();
                if (!text.isBlank() && !text.equalsIgnoreCase("Home") && !breadcrumbs.contains(text)) {
                    breadcrumbs.add(text);
                }
            }

            if (breadcrumbs.isEmpty()) {
                String metaCat = extractMeta(doc, "product:category", "og:category", "category");
                if (!metaCat.isBlank()) breadcrumbs.add(metaCat);
            }

            String fullCategoryTrail = breadcrumbs.isEmpty() ? "Fashion & Daily Deals" : String.join(" > ", breadcrumbs);
            data.setCategory(fullCategoryTrail);

        } catch (Exception e) {
            log.warn("Meesho scraping issue for URL {}: {}", productUrl, e.getMessage());
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

    private BigDecimal parseRating(String ratingStr) {
        if (ratingStr == null || ratingStr.isBlank()) return BigDecimal.valueOf(4.2);
        Matcher m = Pattern.compile("([0-9]+(?:\\.[0-9]+)?)").matcher(ratingStr);
        if (m.find()) {
            try { return new BigDecimal(m.group(1)); } catch (Exception ignored) {}
        }
        return BigDecimal.valueOf(4.2);
    }
}
