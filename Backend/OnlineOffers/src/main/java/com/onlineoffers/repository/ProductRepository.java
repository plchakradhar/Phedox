package com.onlineoffers.repository;

import com.onlineoffers.entity.Product;
import com.onlineoffers.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStatus(ProductStatus status);

    List<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status);

    Optional<Product> findByProductUrl(String productUrl);

    Optional<Product> findByAffiliateUrl(String affiliateUrl);

    boolean existsByProductUrl(String productUrl);

    boolean existsByAffiliateUrl(String affiliateUrl);

    List<Product> findByCategoryIdAndStatus(
            Long categoryId,
            ProductStatus status
    );

    List<Product> findByMarketplaceIdAndStatus(
            Long marketplaceId,
            ProductStatus status
    );

    List<Product> findByExpiresAtBefore(LocalDateTime threshold);

    List<Product> findByCreatedAtBefore(LocalDateTime threshold);
}