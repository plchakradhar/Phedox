package com.onlineoffers.repository;

import com.onlineoffers.entity.ScrapingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScrapingLogRepository extends JpaRepository<ScrapingLog, Long> {

    List<ScrapingLog> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<ScrapingLog> findByMarketplaceOrderByCreatedAtDesc(String marketplace);

    List<ScrapingLog> findByStatusOrderByCreatedAtDesc(String status);

    @Modifying
    @Query("UPDATE ScrapingLog sl SET sl.product = null WHERE sl.product.id = :productId")
    void detachProduct(@Param("productId") Long productId);

    @Modifying
    @Query("UPDATE ScrapingLog sl SET sl.product = null WHERE sl.product.id IN :productIds")
    void detachProductIn(@Param("productIds") List<Long> productIds);
}
