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
public class AmazonScraper implements ProductScraper {

    private static final Logger log = LoggerFactory.getLogger(AmazonScraper.class);

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

    // Amazon item ID pattern e.g.  81vLN7t3oYL  (uppercase+digits, 11 chars)
    private static final Pattern AMAZON_IMG_ID = Pattern.compile("/images/I/([A-Za-z0-9]{11,12})");

    @Override
    public boolean supports(String productUrl) {
        if (productUrl == null || productUrl.isBlank()) return false;
        String url = productUrl.toLowerCase(Locale.ROOT);
        return url.contains("amazon") || url.contains("amzn.") || url.contains("a.co/") || url.contains("z.cn");
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
                    .header("Cache-Control", "no-cache")
                    .timeout(20000)
                    .followRedirects(true)
                    .execute();

            Document doc = response.parse();

            // 1. Title
            String title = extractText(doc, "#productTitle", "span#title", "h1#title", "#title");
            if (title.isBlank()) title = extractMeta(doc, "og:title", "twitter:title");
            if (title.isBlank()) {
                String docTitle = doc.title();
                if (docTitle.contains(":")) {
                    title = docTitle.replaceAll("(?i)^amazon\\.in\\s*:\\s*(?:buy\\s*)?", "").split(":")[0].trim();
                } else {
                    title = docTitle;
                }
            }
            data.setName(title.isBlank() ? "Amazon Deal Product" : title.trim());

            String brand = extractText(doc, "#bylineInfo", "a#bylineInfo", "tr.po-brand td.a-span9 span");
            if (!brand.isBlank()) {
                data.setBrand(brand.replace("Visit the", "").replace("Store", "").replace("Brand:", "").trim());
            }

            // 2. Current Price
            BigDecimal currentPrice = extractPrice(doc,
                    "span.apexPriceToPay span.a-offscreen",
                    "span.priceToPay span.a-offscreen",
                    "#corePrice_desktop span.a-offscreen",
                    "#corePrice_feature_div span.a-offscreen",
                    "#corePriceDisplay_desktop_feature_div span.a-price-whole",
                    "span.a-price span.a-offscreen",
                    "#priceblock_dealprice",
                    "#priceblock_ourprice",
                    "span.a-price-whole",
                    "span.a-color-price");
            data.setCurrentPrice(currentPrice != null ? currentPrice : BigDecimal.ZERO);

            // 3. MRP / Original Price
            BigDecimal originalPrice = extractPrice(doc,
                    "span.a-price.a-text-price span.a-offscreen",
                    "span.basisPrice span.a-offscreen",
                    "#corePriceDisplay_desktop_feature_div span.a-text-price span.a-offscreen",
                    "#listPrice",
                    "span[data-a-strike='true'] span.a-offscreen",
                    "span.a-text-strike",
                    "td.a-span12.a-color-secondary span.a-text-strike");

            // 4. Discount %
            BigDecimal discountPercentage = null;
            String savingsText = extractText(doc,
                    "span.savingsPercentage",
                    "span.reinventPriceSavingsPercentageMargin",
                    "span.a-size-large.a-color-price.savingPriceOverride",
                    "td.a-span12.a-color-price.a-size-base");
            if (!savingsText.isBlank()) {
                Matcher discMatcher = Pattern.compile("([1-9][0-9]?)\\s*%").matcher(savingsText);
                if (discMatcher.find()) {
                    try { discountPercentage = new BigDecimal(discMatcher.group(1)); } catch (Exception ignored) {}
                }
            }

            if (originalPrice != null && currentPrice != null && originalPrice.compareTo(currentPrice) > 0) {
                BigDecimal calculatedDisc = originalPrice.subtract(currentPrice)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(originalPrice, 2, RoundingMode.HALF_UP);
                data.setDiscountPercentage(calculatedDisc);
            } else if (discountPercentage != null && currentPrice != null && currentPrice.compareTo(BigDecimal.ZERO) > 0) {
                data.setDiscountPercentage(discountPercentage);
                BigDecimal multiplier = BigDecimal.ONE.subtract(discountPercentage.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                if (multiplier.compareTo(BigDecimal.ZERO) > 0) {
                    originalPrice = currentPrice.divide(multiplier, 2, RoundingMode.HALF_UP);
                }
            }
            if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) originalPrice = currentPrice;
            data.setOriginalPrice(originalPrice);

            // 5. Stock
            String avail = extractText(doc, "#availability span", "#availability");
            boolean inStock = true;
            if (!avail.isBlank()) {
                String la = avail.toLowerCase(Locale.ROOT);
                if (la.contains("currently unavailable") || la.contains("out of stock") || la.contains("we don't know when")) {
                    inStock = false;
                }
            }
            data.setInStock(inStock);

            // 6. Rating
            String ratingStr = extractText(doc, "#acrPopover span.a-icon-alt", "span[data-hook='rating-out-of-text']", "i.a-icon-star span");
            data.setRating(parseRating(ratingStr));
            String ratingCount = extractText(doc, "#acrCustomerReviewText", "span[data-hook='total-review-count']");
            data.setRatingCount(ratingCount.replaceAll("[^0-9,]", "").trim());

            // 7. HIGH-RESOLUTION UNIQUE product images (max 8)
            List<String> productImages = extractDeduplicatedProductImages(doc);
            data.setImageUrls(productImages);

            // 8. Description
            StringBuilder descBuilder = new StringBuilder();
            Elements bullets = doc.select("#feature-bullets ul li span.a-list-item");
            for (Element bullet : bullets) {
                String t = bullet.text().trim();
                if (!t.isBlank() && !t.toLowerCase(Locale.ROOT).contains("make sure this fits")) {
                    descBuilder.append("• ").append(t).append("\n");
                }
            }
            if (descBuilder.length() == 0) {
                String desc = extractText(doc, "#productDescription p", "#productDescription", "div#featurebullets_feature_div");
                if (desc.isBlank()) desc = extractMeta(doc, "description", "og:description");
                descBuilder.append(desc);
            }
            String finalDesc = descBuilder.toString().trim();
            data.setDescription(finalDesc.length() > 3000 ? finalDesc.substring(0, 3000) : finalDesc);

            // 9. Complete Category & Subcategory Breadcrumb Trail
            List<String> breadcrumbs = new ArrayList<>();
            Elements bcElements = doc.select("#wayfinding-breadcrumbs_feature_div ul li a, div.a-breadcrumb ul li a, #nav-subnav a");
            for (Element bc : bcElements) {
                String text = bc.text().trim();
                if (!text.isBlank() && !text.equalsIgnoreCase("Back to results") && !text.equalsIgnoreCase("Home") && !breadcrumbs.contains(text)) {
                    breadcrumbs.add(text);
                }
            }

            // Fallback: Check Schema.org / JSON-LD BreadcrumbList
            if (breadcrumbs.isEmpty()) {
                Elements jsonLdScripts = doc.select("script[type='application/ld+json']");
                for (Element script : jsonLdScripts) {
                    String json = script.html();
                    if (json.contains("BreadcrumbList")) {
                        Matcher nameMatcher = Pattern.compile("\"name\"\\s*:\\s*\"([^\"]+)\"").matcher(json);
                        while (nameMatcher.find()) {
                            String name = nameMatcher.group(1).trim();
                            if (!name.isBlank() && !name.equalsIgnoreCase("Home") && !breadcrumbs.contains(name)) {
                                breadcrumbs.add(name);
                            }
                        }
                    }
                }
            }

            String fullCategoryTrail = breadcrumbs.isEmpty() ? "Electronics & Deals" : String.join(" > ", breadcrumbs);
            data.setCategory(fullCategoryTrail);

            // 10. Optional Reviews (max 5)
            data.setReviews(extractAmazonReviews(doc));

        } catch (Exception e) {
            log.warn("Amazon scraping error for URL {}: {}", productUrl, e.getMessage());
        }

        return data;
    }

    /**
     * Extracts unique high-resolution Amazon product images by:
     * 1. Deduplicating on the Amazon Image Item ID (11-12 char alphanumeric string)
     * 2. Strictly excluding UI/sprite/nav images
     * 3. Upgrading ALL matched images to ._AC_SL1500_.jpg high-resolution
     * 4. Capping at MAX 8 unique product images
     */
    private List<String> extractDeduplicatedProductImages(Document doc) {
        // Map from Amazon image item ID -> canonical high-res URL (deduplicated)
        Map<String, String> idToUrl = new LinkedHashMap<>();

        // Priority 1: main landing image data-a-dynamic-image (JSON map of URL -> [w,h])
        Element mainImg = doc.selectFirst("#landingImage, #imgBlkFront, #main-image, #imgTagWrapperId img");
        if (mainImg != null) {
            String dynJson = mainImg.attr("data-a-dynamic-image");
            if (!dynJson.isBlank()) {
                Matcher m = Pattern.compile("\"(https://[^\"]+?\\.(?:jpg|jpeg|png|webp))\"").matcher(dynJson);
                while (m.find()) {
                    addAmazonImage(idToUrl, m.group(1));
                }
            }
            String oldHires = mainImg.attr("data-old-hires");
            if (!oldHires.isBlank()) addAmazonImage(idToUrl, oldHires);
            String src = mainImg.attr("src");
            if (!src.isBlank()) addAmazonImage(idToUrl, src);
        }

        // Priority 2: hiRes/large image URLs from embedded JS colorImages data block
        String html = doc.html();
        Matcher scriptMatcher = Pattern.compile("\"(?:hiRes|large)\"\\s*:\\s*\"(https://[^\"]+/images/I/[^\"]+?\\.(?:jpg|jpeg|png|webp))\"").matcher(html);
        while (scriptMatcher.find()) {
            addAmazonImage(idToUrl, scriptMatcher.group(1));
            if (idToUrl.size() >= 10) break; // collect a few extras before dedup cap
        }

        // Priority 3: Alt thumbnail gallery
        Elements thumbs = doc.select("#altImages ul li img, span.a-button-thumbnail img");
        for (Element thumb : thumbs) {
            String src = thumb.attr("src");
            addAmazonImage(idToUrl, src);
        }

        // OG image fallback
        if (idToUrl.isEmpty()) {
            String ogImg = extractMeta(doc, "og:image", "twitter:image");
            addAmazonImage(idToUrl, ogImg);
        }

        // Return max 8 unique product images
        List<String> results = new ArrayList<>(idToUrl.values());
        return results.size() > 8 ? results.subList(0, 8) : results;
    }

    private void addAmazonImage(Map<String, String> idToUrl, String url) {
        if (url == null || url.isBlank() || url.startsWith("data:")) return;
        if (!isAmazonProductImage(url)) return;

        // Extract item ID
        Matcher m = AMAZON_IMG_ID.matcher(url);
        if (m.find()) {
            String itemId = m.group(1);
            // Only add if we haven't seen this item ID yet
            if (!idToUrl.containsKey(itemId)) {
                // Upgrade to ._AC_SL1500_.jpg
                String hiRes = upgradeToHighRes(url);
                idToUrl.put(itemId, hiRes);
            }
        }
    }

    private boolean isAmazonProductImage(String src) {
        if (src == null || src.isBlank() || src.startsWith("data:")) return false;
        String lower = src.toLowerCase(Locale.ROOT);
        // Must be in Amazon /images/I/ (item inventory) path
        if (!lower.contains("/images/i/")) return false;
        // Block Amazon UI/nav/sprite assets
        if (lower.contains("/images/g/") || lower.contains("/g/31/") || lower.contains("/g/01/")) return false;
        if (lower.contains("sprite") || lower.contains("nav-")) return false;
        if (lower.contains(".svg") || lower.contains(".gif")) return false;
        if (lower.contains("loading") || lower.contains("spinner") || lower.contains("pixel")) return false;
        if (lower.contains("play-button") || lower.contains("play-icon") || lower.contains("360_")) return false;
        return true;
    }

    private String upgradeToHighRes(String url) {
        // Replace any _XX_ size suffix with ._AC_SL1500_ for high resolution
        return url.replaceAll("\\._[A-Za-z0-9_,]+_\\.", "._AC_SL1500_.");
    }

    private List<ProductReviewDto> extractAmazonReviews(Document doc) {
        List<ProductReviewDto> reviews = new ArrayList<>();
        try {
            Elements reviewElements = doc.select("div[data-hook='review']");
            for (Element revEl : reviewElements) {
                String author = extractText(revEl, "span.a-profile-name");
                String ratingText = extractText(revEl, "i[data-hook='review-star-rating'] span", "span.a-icon-alt");
                String title = extractText(revEl, "a[data-hook='review-title'] span", "span[data-hook='review-title']");
                String date = extractText(revEl, "span[data-hook='review-date']");
                String comment = extractText(revEl, "span[data-hook='review-body'] span", "span[data-hook='review-body']");
                boolean verified = revEl.select("span[data-hook='avp-badge']").size() > 0;
                if (!comment.isBlank() || !title.isBlank()) {
                    ProductReviewDto dto = new ProductReviewDto();
                    dto.setReviewerName(author.isBlank() ? "Amazon Customer" : author.trim());
                    dto.setRating(ratingText.isBlank() ? "5.0 out of 5 stars" : ratingText.trim());
                    dto.setReviewTitle(title.trim());
                    dto.setComment(comment.trim());
                    dto.setReviewDate(date.isBlank() ? "Recently" : date.trim());
                    dto.setVerifiedPurchase(verified);
                    reviews.add(dto);
                }
                if (reviews.size() >= 5) break;
            }
        } catch (Exception e) {
            log.debug("Could not parse Amazon reviews: {}", e.getMessage());
        }
        return reviews;
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

    private BigDecimal parseRating(String ratingStr) {
        if (ratingStr == null || ratingStr.isBlank()) return BigDecimal.valueOf(4.2);
        Matcher m = Pattern.compile("([0-9]+(?:\\.[0-9]+)?)").matcher(ratingStr);
        if (m.find()) {
            try { return new BigDecimal(m.group(1)); } catch (Exception ignored) {}
        }
        return BigDecimal.valueOf(4.2);
    }
}