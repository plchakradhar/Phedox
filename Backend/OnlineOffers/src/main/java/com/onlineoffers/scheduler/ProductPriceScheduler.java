package com.onlineoffers.scheduler;

import com.onlineoffers.dto.ScrapedProductData;
import com.onlineoffers.entity.Product;
import com.onlineoffers.enums.ProductStatus;
import com.onlineoffers.enums.StockStatus;
import com.onlineoffers.repository.ProductRepository;
import com.onlineoffers.scraper.ScraperFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class ProductPriceScheduler {

    private static final Logger log = LoggerFactory.getLogger(ProductPriceScheduler.class);

    private final ProductRepository productRepository;
    private final ScraperFactory scraperFactory;

    public ProductPriceScheduler(ProductRepository productRepository, ScraperFactory scraperFactory) {
        this.productRepository = productRepository;
        this.scraperFactory = scraperFactory;
    }

    /**
     * Runs every hour to check whether the price of active products has changed.
     * - If price increased: Product is deleted / removed from active website deals.
     * - If price dropped: Current price & lowest price are updated.
     * - If out of stock: Product is removed / marked out of stock.
     */
    @Scheduled(cron = "0 0 * * * ?") // Every hour on the hour
    @Transactional
    public void checkProductPricesHourly() {
        log.info("Starting hourly product price check scheduler at {}", LocalDateTime.now());

        List<Product> activeProducts = productRepository.findByStatus(ProductStatus.ACTIVE);
        log.info("Found {} active products to check", activeProducts.size());

        int deletedCount = 0;
        int updatedPriceDropCount = 0;
        int outOfStockCount = 0;

        for (Product product : activeProducts) {
            try {
                String productUrl = product.getProductUrl();
                if (productUrl == null || productUrl.isBlank()) {
                    continue;
                }

                ScrapedProductData scraped = scraperFactory.getScraper(productUrl).scrape(productUrl);
                if (scraped == null) {
                    continue;
                }

                // 1. Check if product is out of stock
                if (!scraped.isInStock()) {
                    log.info("Product {} is OUT OF STOCK. Marking as OUT_OF_STOCK (removed from site).", product.getId());
                    product.setStockStatus(StockStatus.OUT_OF_STOCK);
                    product.setStatus(ProductStatus.OUT_OF_STOCK);
                    product.setLastCheckedAt(LocalDateTime.now());
                    productRepository.save(product);
                    outOfStockCount++;
                    continue;
                }

                BigDecimal newPrice = scraped.getCurrentPrice();
                if (newPrice == null || newPrice.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }

                BigDecimal oldPrice = product.getCurrentPrice();

                // 2. If price INCREASED -> Remove / Delete product from website
                if (newPrice.compareTo(oldPrice) > 0) {
                    log.info("Product ID {}: Price INCREASED from ₹{} to ₹{}. Deleting deal from website.",
                            product.getId(), oldPrice, newPrice);
                    
                    product.setStatus(ProductStatus.EXPIRED);
                    product.setLastCheckedAt(LocalDateTime.now());
                    productRepository.save(product);
                    deletedCount++;
                }
                // 3. If price DROPPED FURTHER -> Update to the newly dropped price
                else if (newPrice.compareTo(oldPrice) < 0) {
                    log.info("Product ID {}: Price DROPPED from ₹{} to ₹{}! Updating deal.",
                            product.getId(), oldPrice, newPrice);

                    product.setCurrentPrice(newPrice);
                    if (product.getLowestPrice() == null || newPrice.compareTo(product.getLowestPrice()) < 0) {
                        product.setLowestPrice(newPrice);
                    }

                    if (product.getOriginalPrice() != null && product.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal newDiscount = product.getOriginalPrice().subtract(newPrice)
                                .multiply(BigDecimal.valueOf(100))
                                .divide(product.getOriginalPrice(), 2, RoundingMode.HALF_UP);
                        product.setDiscountPercentage(newDiscount);
                    }

                    product.setLastCheckedAt(LocalDateTime.now());
                    productRepository.save(product);
                    updatedPriceDropCount++;
                } else {
                    product.setLastCheckedAt(LocalDateTime.now());
                    productRepository.save(product);
                }

            } catch (Exception e) {
                log.warn("Error re-checking price for product ID {}: {}", product.getId(), e.getMessage());
            }
        }

        log.info("Hourly price check finished. Increased/Removed: {}, Price Drops Updated: {}, Out of Stock: {}",
                deletedCount, updatedPriceDropCount, outOfStockCount);
    }
}
