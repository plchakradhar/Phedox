package com.onlineoffers.service;

import com.onlineoffers.dto.ScrapedProductData;
import com.onlineoffers.entity.Product;
import com.onlineoffers.enums.ProductStatus;
import com.onlineoffers.enums.StockStatus;
import com.onlineoffers.repository.ProductRepository;
import com.onlineoffers.scraper.ScraperFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Runs every hour to re-check prices of all active products.
 *
 * Rules:
 *  - If new price < stored current price  → update price (better deal!)
 *  - If new price drops below 0 or out of stock → mark OUT_OF_STOCK / INACTIVE
 *  - If discount drops below minimum threshold → deactivate product (hide from site)
 *  - If scraping fails → skip silently (don't deactivate)
 */
@Service
public class PriceMonitoringService {

    private static final Logger log = LoggerFactory.getLogger(PriceMonitoringService.class);

    @Value("${deal.minimum.discount.percentage:50}")
    private BigDecimal minimumDealPercentage;

    private final ProductRepository productRepository;
    private final ScraperFactory scraperFactory;

    public PriceMonitoringService(ProductRepository productRepository, ScraperFactory scraperFactory) {
        this.productRepository = productRepository;
        this.scraperFactory = scraperFactory;
    }

    /**
     * Runs at the top of every hour: 00:00, 01:00, 02:00 … 23:00
     */
    @Scheduled(cron = "0 0 * * * *")
    public void runHourlyPriceAudit() {
        log.info("=== Hourly Price Audit Starting ===");

        List<Product> activeProducts = productRepository.findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE);

        if (activeProducts.isEmpty()) {
            log.info("No active products to audit.");
            return;
        }

        log.info("Auditing {} active products...", activeProducts.size());

        int updated = 0;
        int deactivated = 0;
        int skipped = 0;

        for (Product product : activeProducts) {
            try {
                String result = auditProduct(product);
                switch (result) {
                    case "UPDATED" -> updated++;
                    case "DEACTIVATED" -> deactivated++;
                    default -> skipped++;
                }
            } catch (Exception e) {
                log.warn("Failed to audit product #{} ({}): {}", product.getId(), product.getName(), e.getMessage());
                skipped++;
            }
        }

        log.info("=== Hourly Price Audit Complete: {} updated | {} deactivated | {} skipped ===",
                updated, deactivated, skipped);
    }

    @Transactional
    public String auditProduct(Product product) {
        String productUrl = product.getProductUrl();
        if (productUrl == null || productUrl.isBlank()) {
            log.warn("Product #{} has no productUrl, skipping audit", product.getId());
            return "SKIPPED";
        }

        ScrapedProductData fresh;
        try {
            fresh = scraperFactory.getScraper(productUrl).scrape(productUrl);
        } catch (Exception e) {
            log.debug("Scraping failed for product #{}: {}", product.getId(), e.getMessage());
            return "SKIPPED";
        }

        if (fresh == null) {
            return "SKIPPED";
        }

        // Out of stock check
        if (!fresh.isInStock()) {
            log.info("Product #{} '{}' is OUT OF STOCK → deactivating", product.getId(), product.getName());
            product.setStockStatus(StockStatus.OUT_OF_STOCK);
            product.setStatus(ProductStatus.INACTIVE);
            product.setLastCheckedAt(LocalDateTime.now());
            productRepository.save(product);
            return "DEACTIVATED";
        }

        BigDecimal newPrice = fresh.getCurrentPrice();
        BigDecimal newMrp = fresh.getOriginalPrice();

        // Skip if scraper couldn't determine price
        if (newPrice == null || newPrice.compareTo(BigDecimal.ZERO) <= 0) {
            // Update only lastCheckedAt
            product.setLastCheckedAt(LocalDateTime.now());
            productRepository.save(product);
            return "SKIPPED";
        }

        // Use stored originalPrice if scraper couldn't get MRP
        BigDecimal effectiveMrp = (newMrp != null && newMrp.compareTo(BigDecimal.ZERO) > 0)
                ? newMrp
                : product.getOriginalPrice();

        if (effectiveMrp == null || effectiveMrp.compareTo(BigDecimal.ZERO) <= 0) {
            effectiveMrp = newPrice;
        }

        // Calculate new discount
        BigDecimal newDiscount = calculateDiscount(effectiveMrp, newPrice);
        BigDecimal threshold = minimumDealPercentage != null ? minimumDealPercentage : BigDecimal.valueOf(50);

        // Check if discount still qualifies
        if (newDiscount.compareTo(threshold) < 0) {
            log.info("Product #{} '{}' discount dropped to {}% (below {}% threshold) → deactivating",
                    product.getId(), product.getName(), newDiscount, threshold);
            product.setStatus(ProductStatus.INACTIVE);
            product.setLastCheckedAt(LocalDateTime.now());
            productRepository.save(product);
            return "DEACTIVATED";
        }

        // Price improved (dropped even lower)
        boolean priceChanged = false;
        if (newPrice.compareTo(product.getCurrentPrice()) < 0) {
            log.info("Product #{} '{}' price dropped: ₹{} → ₹{}", 
                    product.getId(), product.getName(), product.getCurrentPrice(), newPrice);
            product.setLowestPrice(newPrice);
            product.setCurrentPrice(newPrice);
            product.setDiscountPercentage(newDiscount);
            priceChanged = true;
        } else if (newPrice.compareTo(product.getCurrentPrice()) > 0) {
            // Price went up but still above threshold - update but keep active
            log.info("Product #{} '{}' price rose: ₹{} → ₹{} (still {}% off, still active)",
                    product.getId(), product.getName(), product.getCurrentPrice(), newPrice, newDiscount);
            product.setCurrentPrice(newPrice);
            product.setDiscountPercentage(newDiscount);
            priceChanged = true;
        }

        product.setStockStatus(StockStatus.IN_STOCK);
        product.setLastCheckedAt(LocalDateTime.now());
        productRepository.save(product);

        return priceChanged ? "UPDATED" : "SKIPPED";
    }

    private BigDecimal calculateDiscount(BigDecimal originalPrice, BigDecimal currentPrice) {
        if (originalPrice == null || currentPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (currentPrice.compareTo(originalPrice) >= 0) {
            return BigDecimal.ZERO;
        }
        return originalPrice.subtract(currentPrice)
                .multiply(BigDecimal.valueOf(100))
                .divide(originalPrice, 2, RoundingMode.HALF_UP);
    }
}
