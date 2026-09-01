package com.onlineoffers.scheduler;

import com.onlineoffers.entity.Product;
import com.onlineoffers.enums.ProductStatus;
import com.onlineoffers.enums.StockStatus;
import com.onlineoffers.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ProductStockScheduler {

    private static final Logger log = LoggerFactory.getLogger(ProductStockScheduler.class);

    private final ProductRepository productRepository;

    public ProductStockScheduler(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Cleans up out of stock or expired products so website only shows active in-stock deals.
     */
    @Scheduled(cron = "0 15 * * * ?") // Every hour at :15
    @Transactional
    public void cleanupOutOfStockProducts() {
        log.info("Running stock status consistency scheduler");
        List<Product> outOfStockProducts = productRepository.findByStatus(ProductStatus.OUT_OF_STOCK);
        for (Product p : outOfStockProducts) {
            p.setStockStatus(StockStatus.OUT_OF_STOCK);
            p.setLastCheckedAt(LocalDateTime.now());
            productRepository.save(p);
        }
    }
}
