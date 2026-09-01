package com.onlineoffers.scraper;

import com.onlineoffers.dto.ScrapedProductData;

public interface ProductScraper {

    ScrapedProductData scrape(String productUrl);

    boolean supports(String productUrl);
}