package com.onlineoffers.scheduler;

import com.onlineoffers.entity.Product;
import com.onlineoffers.repository.ProductClickRepository;
import com.onlineoffers.repository.ProductRepository;
import com.onlineoffers.repository.ProductReviewRepository;
import com.onlineoffers.repository.ScrapingLogRepository;
import com.onlineoffers.repository.TelegramPostRepository;
import com.onlineoffers.service.ImageStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ProductExpiryPurgeScheduler {

    private static final Logger log = LoggerFactory.getLogger(ProductExpiryPurgeScheduler.class);

    private final ProductRepository productRepository;
    private final ProductReviewRepository productReviewRepository;
    private final ProductClickRepository productClickRepository;
    private final TelegramPostRepository telegramPostRepository;
    private final ScrapingLogRepository scrapingLogRepository;
    private final ImageStorageService imageStorageService;

    public ProductExpiryPurgeScheduler(
            ProductRepository productRepository,
            ProductReviewRepository productReviewRepository,
            ProductClickRepository productClickRepository,
            TelegramPostRepository telegramPostRepository,
            ScrapingLogRepository scrapingLogRepository,
            ImageStorageService imageStorageService
    ) {
        this.productRepository = productRepository;
        this.productReviewRepository = productReviewRepository;
        this.productClickRepository = productClickRepository;
        this.telegramPostRepository = telegramPostRepository;
        this.scrapingLogRepository = scrapingLogRepository;
        this.imageStorageService = imageStorageService;
    }

    /**
     * Periodically runs every 15 minutes to permanently purge expired deals (>= 32 hours old).
     * Retains Telegram post ingestion history and Scraping logs for audit/debugging.
     */
    @Scheduled(cron = "0 */15 * * * ?")
    @Transactional
    public void purgeExpiredDeals() {
        LocalDateTime now = LocalDateTime.now();
        List<Product> expiredProducts = productRepository.findByExpiresAtBefore(now);

        if (expiredProducts.isEmpty()) {
            log.debug("32-hour auto-purge check complete: No expired products found.");
            return;
        }

        log.info("Found {} expired product(s) to purge from website and database (expiresAt <= {}).",
                expiredProducts.size(), now);

        int purgedCount = 0;
        for (Product product : expiredProducts) {
            try {
                Long productId = product.getId();

                // 1. Delete image files from disk and image rows
                imageStorageService.deleteImagesForProduct(productId);

                // 2. Delete associated customer reviews
                productReviewRepository.deleteByProductId(productId);

                // 3. Delete click tracking history
                productClickRepository.deleteByProductId(productId);

                // 4. Detach foreign key in TelegramPost (retain post audit history)
                telegramPostRepository.detachProduct(productId);

                // 5. Detach foreign key in ScrapingLog (retain log history for debugging)
                scrapingLogRepository.detachProduct(productId);

                // 6. Permanently delete product from database
                productRepository.delete(product);

                purgedCount++;
                log.info("Purged expired product #{} ('{}', expired at {})",
                        productId, product.getName(), product.getExpiresAt());

            } catch (Exception e) {
                log.error("Failed to purge expired product #{}: {}", product.getId(), e.getMessage(), e);
            }
        }

        log.info("Completed 32-hour deal purge. Successfully removed {}/{} expired products.",
                purgedCount, expiredProducts.size());
    }
}