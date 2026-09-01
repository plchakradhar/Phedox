package com.onlineoffers.repository;

import com.onlineoffers.entity.Product;
import com.onlineoffers.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    List<ProductReview> findByProductOrderByCreatedAtDesc(Product product);

    List<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId);

    @Modifying
    @Query("DELETE FROM ProductReview r WHERE r.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);

    @Modifying
    @Query("DELETE FROM ProductReview r WHERE r.product.id IN :productIds")
    void deleteByProductIdIn(@Param("productIds") List<Long> productIds);
}
