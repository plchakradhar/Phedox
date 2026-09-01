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

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DeadLinkScheduler {

    private static final Logger log = LoggerFactory.getLogger(DeadLinkScheduler.class);

    private final ProductRepository productRepository;
    private final HttpClient httpClient;

    public DeadLinkScheduler(ProductRepository productRepository) {
        this.productRepository = productRepository;
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Periodically checks active deal links to handle dead/broken/expired affiliate links.
     */
    @Scheduled(cron = "0 30 * * * ?") // Every hour at :30
    @Transactional
    public void validateActiveDealLinks() {
        log.info("Starting dead link validation scheduler");
        List<Product> activeProducts = productRepository.findByStatus(ProductStatus.ACTIVE);

        for (Product product : activeProducts) {
            try {
                String checkUrl = product.getProductUrl() != null ? product.getProductUrl() : product.getAffiliateUrl();
                if (checkUrl == null || checkUrl.isBlank()) {
                    continue;
                }

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(checkUrl))
                        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                        .timeout(Duration.ofSeconds(10))
                        .GET()
                        .build();

                HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
                int statusCode = response.statusCode();

                if (statusCode == 404 || statusCode == 410) {
                    log.info("Dead link (HTTP {}) detected for Product ID: {}. Marking EXPIRED.", statusCode, product.getId());
                    product.setStatus(ProductStatus.EXPIRED);
                    productRepository.save(product);
                }
            } catch (Exception e) {
                log.warn("Could not verify link for product {}: {}", product.getId(), e.getMessage());
            }
        }
    }
}
