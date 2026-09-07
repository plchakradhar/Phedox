package com.onlineoffers.service;

import com.onlineoffers.entity.Product;
import com.onlineoffers.entity.ProductClick;
import com.onlineoffers.exception.SecurityValidationException;
import com.onlineoffers.repository.ProductClickRepository;
import com.onlineoffers.repository.ProductRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ClickTrackingService {

    private static final Logger log = LoggerFactory.getLogger(ClickTrackingService.class);

    private static final Set<String> DEFAULT_ALLOWED_DOMAINS = Set.of(
            "amazon.in", "amzn.to", "amzn.in", "amazon.com",
            "flipkart.com", "fkrt.it", "dl.flipkart.com", "fkrt.co",
            "myntra.com", "meesho.com", "ajio.com",
            "croma.com", "tatacliq.com", "nykaa.com",
            "jiomart.com", "snapdeal.com", "shopsy.in",
            "reliancedigital.in", "swiggy.com", "zomato.com"
    );

    @Value("${app.redirect.allowed-domains:}")
    private String customAllowedDomains;

    private final ProductClickRepository productClickRepository;
    private final ProductRepository productRepository;

    public ClickTrackingService(ProductClickRepository productClickRepository, ProductRepository productRepository) {
        this.productClickRepository = productClickRepository;
        this.productRepository = productRepository;
    }

    public boolean isAllowedRedirectHost(String redirectUrl) {
        if (redirectUrl == null || redirectUrl.isBlank()) {
            return false;
        }

        try {
            String trimmed = redirectUrl.trim();
            if (!trimmed.matches("(?i)^https?://.*")) {
                trimmed = "https://" + trimmed;
            }

            URI uri = URI.create(trimmed);
            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                return false;
            }

            String lowerHost = host.toLowerCase(Locale.ROOT);

            // Allow localhost & local loopback for local testing
            if (lowerHost.equals("localhost") || lowerHost.equals("127.0.0.1") || lowerHost.startsWith("localhost:") || lowerHost.startsWith("127.0.0.1:")) {
                return true;
            }

            // Check default allowlist
            for (String domain : DEFAULT_ALLOWED_DOMAINS) {
                if (lowerHost.equals(domain) || lowerHost.endsWith("." + domain)) {
                    return true;
                }
            }

            // Check configured custom domains
            if (customAllowedDomains != null && !customAllowedDomains.isBlank()) {
                for (String domain : customAllowedDomains.split(",")) {
                    String clean = domain.trim().toLowerCase(Locale.ROOT);
                    if (!clean.isEmpty() && (lowerHost.equals(clean) || lowerHost.endsWith("." + clean))) {
                        return true;
                    }
                }
            }

            return false;
        } catch (Exception e) {
            log.warn("Invalid redirect URL format: {}", redirectUrl);
            return false;
        }
    }

    @Transactional
    public String trackClickAndGetRedirectUrl(Long productId, HttpServletRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        String affiliateUrl = product.getAffiliateUrl();
        if (affiliateUrl == null || affiliateUrl.isBlank()) {
            affiliateUrl = product.getProductUrl();
        }

        if (affiliateUrl == null || !isAllowedRedirectHost(affiliateUrl)) {
            log.warn("Open redirect blocked for product ID {}: URL '{}'", productId, affiliateUrl);
            throw new SecurityValidationException("Redirection destination is not in the trusted merchant domain allowlist.");
        }

        try {
            recordClickAsync(product, request);
        } catch (Exception e) {
            log.warn("Could not record click analytics: {}", e.getMessage());
        }

        return affiliateUrl;
    }

    @Async
    public void recordClickAsync(Product product, HttpServletRequest request) {
        try {
            ProductClick click = new ProductClick();
            click.setProduct(product);
            click.setMarketplace(product.getMarketplace() != null ? product.getMarketplace().getName() : "Unknown");
            click.setClickedAt(LocalDateTime.now());

            if (request != null) {
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isBlank()) {
                    ip = request.getRemoteAddr();
                } else if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                click.setIpAddress(ip != null && ip.length() > 45 ? ip.substring(0, 45) : ip);

                String userAgent = request.getHeader("User-Agent");
                click.setUserAgent(userAgent != null && userAgent.length() > 500 ? userAgent.substring(0, 500) : userAgent);
            }

            productClickRepository.save(click);
        } catch (Exception e) {
            log.warn("Error persisting click record: {}", e.getMessage());
        }
    }
}
