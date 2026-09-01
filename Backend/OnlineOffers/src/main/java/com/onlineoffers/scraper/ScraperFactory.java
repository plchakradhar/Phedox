package com.onlineoffers.scraper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ScraperFactory {

    private static final Logger log = LoggerFactory.getLogger(ScraperFactory.class);

    private final List<ProductScraper> scrapers;
    private final GenericMarketplaceScraper genericScraper;

    public ScraperFactory(List<ProductScraper> scrapers, GenericMarketplaceScraper genericScraper) {
        this.scrapers = scrapers;
        this.genericScraper = genericScraper;
    }

    public ProductScraper getScraper(String productUrl) {
        if (productUrl == null || productUrl.isBlank()) {
            log.warn("Product URL is empty, using generic scraper");
            return genericScraper;
        }

        return scrapers.stream()
                .filter(scraper -> scraper.supports(productUrl))
                .filter(scraper -> !(scraper instanceof GenericMarketplaceScraper))
                .findFirst()
                .orElseGet(() -> {
                    log.debug("No specific scraper for URL {}, using generic scraper", productUrl);
                    return genericScraper;
                });
    }
}