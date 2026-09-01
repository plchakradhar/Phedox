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
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class MyntraScraper implements ProductScraper {

    private static final Logger log = LoggerFactory.getLogger(MyntraScraper.class);

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    @Override
    public boolean supports(String productUrl) {
        if (productUrl == null || productUrl.isBlank()) {
            return false;
        }
        return productUrl.toLowerCase().contains("myntra.com");
    }

    @Override
    public ScrapedProductData scrape(String productUrl) {
        ScrapedProductData data = new ScrapedProductData();
        data.setProductUrl(productUrl);
        data.setCategory("Fashion");

        try {
            Connection.Response response = Jsoup.connect(productUrl)
                    .userAgent(USER_AGENT)
                    .timeout(15000)
                    .followRedirects(true)
                    .execute();

            Document doc = response.parse();

            String title = extractMeta(doc, "og:title", "twitter:title");
            if (title.isBlank()) {
                Element titleEl = doc.selectFirst("h1.pdp-title, h1.pdp-name");
                if (titleEl != null) title = titleEl.text();
            }
            data.setName(title.isBlank() ? "Myntra Deal Product" : title.trim());

            // Price from pdp-price or meta
            Element priceEl = doc.selectFirst("span.pdp-price strong, span.pdp-price");
            if (priceEl != null) {
                String priceText = priceEl.text().replaceAll("[^0-9.]", "");
                if (!priceText.isBlank()) {
                    data.setCurrentPrice(new BigDecimal(priceText));
                }
            }

            Element mrpEl = doc.selectFirst("span.pdp-mrp s, span.pdp-mrp");
            if (mrpEl != null) {
                String mrpText = mrpEl.text().replaceAll("[^0-9.]", "");
                if (!mrpText.isBlank()) {
                    data.setOriginalPrice(new BigDecimal(mrpText));
                }
            }

            if (data.getOriginalPrice() == null || data.getOriginalPrice().compareTo(BigDecimal.ZERO) == 0) {
                data.setOriginalPrice(data.getCurrentPrice());
            }

            data.setInStock(true);
            data.setRating(BigDecimal.valueOf(4.2));
            data.setRatingCount("100");

            List<String> images = new ArrayList<>();
            String ogImg = extractMeta(doc, "og:image");
            if (!ogImg.isBlank()) {
                images.add(ogImg);
            }
            data.setImageUrls(images);

            String desc = extractMeta(doc, "og:description");
            data.setDescription(desc);

            // Category breadcrumbs
            List<String> breadcrumbs = new ArrayList<>();
            Elements bcElements = doc.select("ul.breadcrumbs-list li a, div.breadcrumbs-container a, .breadcrumbs a");
            for (Element bc : bcElements) {
                String text = bc.text().trim();
                if (!text.isBlank() && !text.equalsIgnoreCase("Home") && !breadcrumbs.contains(text)) {
                    breadcrumbs.add(text);
                }
            }
            if (!breadcrumbs.isEmpty()) {
                data.setCategory(String.join(" > ", breadcrumbs));
            } else {
                data.setCategory("Fashion");
            }

        } catch (Exception e) {
            log.warn("Myntra scraping encountered issue for URL {}: {}", productUrl, e.getMessage());
        }

        return data;
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
}