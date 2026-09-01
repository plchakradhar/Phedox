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
public class GenericMarketplaceScraper implements ProductScraper {

    private static final Logger log = LoggerFactory.getLogger(GenericMarketplaceScraper.class);

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

    @Override
    public boolean supports(String productUrl) {
        return true; // Fallback scraper
    }

    @Override
    public ScrapedProductData scrape(String productUrl) {
        ScrapedProductData data = new ScrapedProductData();
        data.setProductUrl(productUrl);
        data.setCategory("Exclusive Deals");

        try {
            Connection.Response response = Jsoup.connect(productUrl)
                    .userAgent(USER_AGENT)
                    .timeout(20000)
                    .followRedirects(true)
                    .execute();

            Document doc = response.parse();

            // Title
            String title = extractMeta(doc, "og:title", "twitter:title");
            if (title.isBlank()) {
                Element h1 = doc.selectFirst("h1");
                if (h1 != null) title = h1.text();
            }
            if (title.isBlank()) {
                title = doc.title();
            }
            data.setName(title.isBlank() ? "Special Deal Product" : title.trim());

            // Extract genuine product images (Excluding UI sprites, icons, nav images)
            Set<String> images = new LinkedHashSet<>();
            String ogImg = extractMeta(doc, "og:image", "twitter:image");
            if (isValidProductImageUrl(ogImg)) {
                images.add(ogImg);
            }

            // Schema.org Product image
            Elements schemaImgs = doc.select("[itemprop='image'], [property='product:image']");
            for (Element el : schemaImgs) {
                String src = el.hasAttr("src") ? el.attr("src") : el.attr("content");
                if (isValidProductImageUrl(src)) {
                    images.add(src);
                }
            }

            // General image tags
            Elements allImgs = doc.select("img[src*='product'], img[src*='upload'], img[src*='media'], img[src*='image']");
            for (Element el : allImgs) {
                String src = el.attr("src");
                if (isValidProductImageUrl(src)) {
                    images.add(src);
                }
            }
            data.setImageUrls(new ArrayList<>(images));

            // Description
            String desc = extractMeta(doc, "og:description", "description", "twitter:description");
            if (desc.isBlank()) {
                Element descEl = doc.selectFirst(".description, #description, [itemprop='description']");
                if (descEl != null) desc = descEl.text();
            }
            data.setDescription(desc);

            // Current Price
            BigDecimal currentPrice = extractPriceFromMeta(doc, "product:price:amount", "og:price:amount", "price");
            if (currentPrice == null) {
                Element priceEl = doc.selectFirst(".price, .current-price, .special-price, [itemprop='price']");
                if (priceEl != null) {
                    currentPrice = parsePriceString(priceEl.text());
                }
            }
            data.setCurrentPrice(currentPrice != null ? currentPrice : BigDecimal.ZERO);

            // Original Price / MRP
            BigDecimal originalPrice = extractPriceFromMeta(doc, "product:original_price:amount", "original_price");
            if (originalPrice == null) {
                Element origPriceEl = doc.selectFirst(".mrp, .original-price, .old-price, .strike, del, s");
                if (origPriceEl != null) {
                    originalPrice = parsePriceString(origPriceEl.text());
                }
            }
            if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
                originalPrice = currentPrice;
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
            data.setRatingCount("50+");

            // Category & Breadcrumbs
            List<String> breadcrumbs = new ArrayList<>();
            Elements bcElements = doc.select(".breadcrumb a, .breadcrumbs a, nav.breadcrumb a, [itemprop='breadcrumb'] a");
            for (Element bc : bcElements) {
                String text = bc.text().trim();
                if (!text.isBlank() && !text.equalsIgnoreCase("Home") && !breadcrumbs.contains(text)) {
                    breadcrumbs.add(text);
                }
            }
            if (!breadcrumbs.isEmpty()) {
                data.setCategory(String.join(" > ", breadcrumbs));
            } else {
                String metaCat = extractMeta(doc, "product:category", "category", "og:category");
                data.setCategory(!metaCat.isBlank() ? metaCat : "Exclusive Deals");
            }

            // Optional Reviews
            List<ProductReviewDto> reviews = new ArrayList<>();
            Elements reviewNodes = doc.select("[itemprop='review'], .review-item, .customer-review");
            for (Element rev : reviewNodes) {
                String author = rev.select("[itemprop='author'], .author, .reviewer-name").text();
                String body = rev.select("[itemprop='reviewBody'], .review-body, .review-content, p").text();
                String rating = rev.select("[itemprop='ratingValue'], .rating, .stars").text();

                if (!body.isBlank()) {
                    ProductReviewDto dto = new ProductReviewDto();
                    dto.setReviewerName(author.isBlank() ? "Verified Customer" : author.trim());
                    dto.setRating(rating.isBlank() ? "5.0 ★" : rating.trim());
                    dto.setReviewTitle("Verified Purchase Review");
                    dto.setComment(body.trim());
                    dto.setReviewDate("Recently");
                    dto.setVerifiedPurchase(true);
                    reviews.add(dto);
                }
                if (reviews.size() >= 4) break;
            }
            data.setReviews(reviews);

        } catch (Exception e) {
            log.warn("Generic scraping issue for URL {}: {}", productUrl, e.getMessage());
        }

        return data;
    }

    private boolean isValidProductImageUrl(String url) {
        if (url == null || url.isBlank() || url.startsWith("data:")) return false;
        String lower = url.toLowerCase(Locale.ROOT);
        // Exclude icons, SVGs, GIFs, sprites, logos, loaders
        if (lower.endsWith(".svg") || lower.endsWith(".gif")) return false;
        if (lower.contains("/images/g/") || lower.contains("/g/31/") || lower.contains("/g/01/")) return false;
        if (lower.contains("sprite") || lower.contains("nav-") || lower.contains("pixel") || lower.contains("1x1")) return false;
        if (lower.contains("loading") || lower.contains("spinner") || lower.contains("placeholder")) return false;
        if (lower.contains("play-button") || lower.contains("play-icon") || lower.contains("360_")) return false;
        if (lower.contains("icon") || lower.contains("logo") || lower.contains("badge")) return false;
        if (lower.contains("arrow") || lower.contains("banner") || lower.contains("header")) return false;
        return true;
    }

    private String extractMeta(Document doc, String... metaNames) {
        for (String name : metaNames) {
            Element el = doc.selectFirst("meta[property='" + name + "'], meta[name='" + name + "']");
            if (el != null && el.hasAttr("content") && !el.attr("content").isBlank()) {
                return el.attr("content").trim();
            }
        }
        return "";
    }

    private BigDecimal extractPriceFromMeta(Document doc, String... metaNames) {
        for (String name : metaNames) {
            Element el = doc.selectFirst("meta[property='" + name + "'], meta[name='" + name + "']");
            if (el != null && el.hasAttr("content") && !el.attr("content").isBlank()) {
                BigDecimal p = parsePriceString(el.attr("content"));
                if (p != null) return p;
            }
        }
        return null;
    }

    private BigDecimal parsePriceString(String text) {
        if (text == null || text.isBlank()) return null;
        String clean = text.replaceAll("[^0-9.]", "").trim();
        if (clean.isBlank()) return null;
        try {
            return new BigDecimal(clean);
        } catch (Exception e) {
            return null;
        }
    }
}