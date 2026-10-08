package com.onlineoffers.repository;

import com.onlineoffers.entity.ProductClick;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ProductClickRepository extends JpaRepository<ProductClick, Long> {

    long countByProductId(Long productId);

    long countByMarketplace(String marketplace);

    long countByClickedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    List<ProductClick> findByProductIdOrderByClickedAtDesc(
            Long productId
    );

    @Query("""
        SELECT COUNT(pc)
        FROM ProductClick pc
        WHERE pc.product.id = :productId
        AND pc.clickedAt BETWEEN :start AND :end
    """)
    long countProductClicksBetween(
            @Param("productId") Long productId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Modifying
    @Query("DELETE FROM ProductClick pc WHERE pc.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);

    @Modifying
    @Query("DELETE FROM ProductClick pc WHERE pc.product.id IN :productIds")
    void deleteByProductIdIn(@Param("productIds") List<Long> productIds);

    @Modifying
    @Query("DELETE FROM ProductClick pc WHERE pc.clickedAt < :cutoff")
    int deleteByClickedAtBefore(@Param("cutoff") java.time.LocalDateTime cutoff);
}
