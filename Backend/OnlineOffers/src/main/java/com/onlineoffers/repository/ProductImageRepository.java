package com.onlineoffers.repository;

import com.onlineoffers.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository
        extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(
            Long productId
    );

    Optional<ProductImage> findByProductIdAndIsPrimaryTrue(
            Long productId
    );

    void deleteByProductId(Long productId);
}