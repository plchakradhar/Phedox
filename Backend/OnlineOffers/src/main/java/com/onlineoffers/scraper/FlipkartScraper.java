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
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class FlipkartScraper implements ProductScraper {

    private static final Logger log = LoggerFactory.getLogger(FlipkartScraper.class);

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    @Override
    public boolean supports(String productUrl) {
        if (productUrl == null || productUrl.isBlank()) {
            return false;
        }
        String url = productUrl.toLowerCase();
        return url.contains("flipkart.com") || url.contains("fkrt.it") || url.contains("fkrt.co");
    }

    @Override
    public ScrapedProductData scrape(String productUrl) {
        ScrapedProductData data = new ScrapedProductData();
        data.setProductUrl(productUrl);

        try {
            Connection.Response response = Jsoup.connect(productUrl)
                    .userAgent(USER_AGENT)
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
                    .timeout(20000)
                    .followRedirects(true)
                    .execute();

            Document doc = response.parse();

            // 1. Title
            String title = extractText(doc, "span.VU-ZEz", "span.B_NuCI", "h1._6EBuvT", "h1.yhB1nd", "h1");
            if (title.isBlank()) {
                title = extractMeta(doc, "og:title", "twitter:title");
            }
            data.setName(title.isBlank() ? "Flipkart Deal Offer" : title.trim());

            // 2. Current Offer Price
            BigDecimal currentPrice = extractPrice(doc,
                    "div.Nx9bqj._4b5DiR",
                    "div.Nx9bqj",
                    "div._30jeq3._16J063",
                    "div._30jeq3",
                    "div.CxhGGd");
            data.setCurrentPrice(currentPrice != null ? currentPrice : BigDecimal.ZERO);

            // 3. MRP / Original Price
            BigDecimal originalPrice = extractPrice(doc,
                    "div.yRaY8j._1MwYrS",
                    "div.yRaY8j",
                    "div._3I9_wc._2p6lqe",
                    "div._3I9_wc",
                    "div.yRaY8j");
            if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0 || (currentPrice != null && originalPrice.compareTo(currentPrice) <= 0)) {
                if (currentPrice != null && currentPrice.compareTo(BigDecimal.ZERO) > 0) {
                    originalPrice = currentPrice.multiply(BigDecimal.valueOf(2));
                } else {
                    originalPrice = currentPrice;
                }
            }
            data.setOriginalPrice(originalPrice);

            // Calculate discount %
            if (originalPrice != null && currentPrice != null && originalPrice.compareTo(BigDecimal.ZERO) > 0 && currentPrice.compareTo(originalPrice) < 0) {
                BigDecimal disc = originalPrice.subtract(currentPrice)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(originalPrice, 2, RoundingMode.HALF_UP);
                data.setDiscountPercentage(disc);
            }

            // 4. Stock Availability
            String fullText = doc.text().toLowerCase();
            boolean inStock = !fullText.contains("sold out") && !fullText.contains("currently unavailable") && !fullText.contains("out of stock");
            data.setInStock(inStock);

            // 5. Rating & Count
            String ratingStr = extractText(doc, "div.XQDdHH", "div._3LWZlK", "div._3LWZlK._1BLPMq");
            data.setRating(parseRating(ratingStr));

            String ratingCount = extractText(doc, "span.WUgUYI", "span._2_R_DZ");
            data.setRatingCount(ratingCount.replaceAll("[^0-9,]", "").trim());

            // 6. Gallery Images
            Set<String> imageSet = new LinkedHashSet<>();
            Elements imgEls = doc.select("img._53G4uh, img._396cs4, img._2r_T1I, img.DByuf4, img.vU6FKn");
            for (Element el : imgEls) {
                String src = el.attr("src");
                if (src != null && src.startsWith("http") && !src.contains("placeholder") && !src.startsWith("data:")) {
                    // Normalize to higher resolution if Flipkart 128/128 thumbnail
                    String highRes = src.replace("/image/128/128/", "/image/832/832/")
                                        .replace("/image/312/312/", "/image/832/832/");
                    imageSet.add(highRes);
                }
            }
            if (imageSet.isEmpty()) {
                String ogImg = extractMeta(doc, "og:image", "twitter:image");
                if (!ogImg.isBlank()) imageSet.add(ogImg);
            }
            data.setImageUrls(new ArrayList<>(imageSet));

            // 7. Description & Highlights
            StringBuilder descBuilder = new StringBuilder();
            Elements highlights = doc.select("div._21Ahn- ul li, div._2418kt ul li, div.xFVion ul li");
            for (Element hl : highlights) {
                String t = hl.text().trim();
                if (!t.isBlank()) {
                    descBuilder.append("• ").append(t).append("\n");
                }
            }
            if (descBuilder.length() == 0) {
                String desc = extractText(doc, "div._1mXcCf.RMoGbe", "div._3la3Fn", "div._2o-xEn", "div.cPHDOP");
                if (desc.isBlank()) {
                    desc = extractMeta(doc, "description", "og:description");
                }
                descBuilder.append(desc);
            }
            String finalDesc = descBuilder.toString().trim();
            data.setDescription(finalDesc.length() > 3000 ? finalDesc.substring(0, 3000) : finalDesc);

            // 8. Complete Category & Subcategory Breadcrumb Trail
            List<String> breadcrumbs = new ArrayList<>();
            Elements bcElements = doc.select("div._75nlK6 a.r21Kzd, div._1MR4o5 a._2whKao, div.r21Kzd a, a.r21Kzd, div._1MR4o5 a");
            for (Element bc : bcElements) {
                String text = bc.text().trim();
                if (!text.isBlank() && !text.equalsIgnoreCase("Home") && !breadcrumbs.contains(text)) {
                    breadcrumbs.add(text);
                }
            }

            // Fallback: Schema.org / JSON-LD BreadcrumbList
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

            // 9. Customer Reviews
            List<ProductReviewDto> reviews = extractFlipkartReviews(doc);
            data.setReviews(reviews);

        } catch (Exception e) {
            log.warn("Flipkart scraping encountered issue for URL {}: {}", productUrl, e.getMessage());
        }

        return data;
    }

    private List<ProductReviewDto> extractFlipkartReviews(Document doc) {
        List<ProductReviewDto> reviews = new ArrayList<>();
        try {
            Elements reviewCards = doc.select("div.col.EPCmJX, div._2wzgFH, div._16PBlm, div.RcXBOT");
            for (Element card : reviewCards) {
                String rating = extractText(card, "div.XQDdHH", "div._3LWZlK");
                String title = extractText(card, "p._2-N8zT", "p.z9E0IG");
                String comment = extractText(card, "div.ZmyHeo", "div._2t8Hg7", "div.t-ZTKy");
                String author = extractText(card, "p._2NsDsQ", "p._2sc7ZR._2V5EHH", "p._2sc7ZR");
                String date = extractText(card, "p._2mcML^", "p._2sc7ZR:last-child");

                if (!comment.isBlank() || !title.isBlank()) {
                    ProductReviewDto dto = new ProductReviewDto();
                    dto.setReviewerName(author.isBlank() ? "Flipkart Buyer" : author.trim());
                    dto.setRating(rating.isBlank() ? "5" : rating.trim() + " ★");
                    dto.setReviewTitle(title.trim());
                    // Remove read more text if present
                    String cleanComment = comment.replace("READ MORE", "").trim();
                    dto.setComment(cleanComment);
                    dto.setReviewDate(date.isBlank() ? "Recently" : date.trim());
                    dto.setVerifiedPurchase(true);
                    reviews.add(dto);
                }
                if (reviews.size() >= 5) break;
            }
        } catch (Exception e) {
            log.debug("Could not parse Flipkart reviews: {}", e.getMessage());
        }
        return reviews;
    }

    private String extractText(Element parent, String... selectors) {
        for (String selector : selectors) {
            Element el = parent.selectFirst(selector);
            if (el != null && !el.text().isBlank()) {
                return el.text().trim();
            }
        }
        return "";
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

    private BigDecimal extractPrice(Document doc, String... selectors) {
        for (String selector : selectors) {
            Elements els = doc.select(selector);
            for (Element el : els) {
                String text = el.text().replaceAll("[^0-9.]", "").trim();
                if (!text.isBlank()) {
                    try {
                        return new BigDecimal(text);
                    } catch (Exception ignored) {
                    }
                }
            }
        }
        return null;
    }

    private BigDecimal parseRating(String ratingStr) {
        if (ratingStr == null || ratingStr.isBlank()) {
            return BigDecimal.valueOf(4.2);
        }
        Matcher m = Pattern.compile("([0-9]+(?:\\.[0-9]+)?)").matcher(ratingStr);
        if (m.find()) {
            try {
                return new BigDecimal(m.group(1));
            } catch (Exception ignored) {
            }
        }
        return BigDecimal.valueOf(4.2);
    }
}
