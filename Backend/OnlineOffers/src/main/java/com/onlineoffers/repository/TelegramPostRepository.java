package com.onlineoffers.repository;

import com.onlineoffers.entity.TelegramPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TelegramPostRepository extends JpaRepository<TelegramPost, Long> {

    Optional<TelegramPost> findByChannelIdAndTelegramMessageId(
            String channelId,
            Long telegramMessageId
    );

    boolean existsByChannelIdAndTelegramMessageId(
            String channelId,
            Long telegramMessageId
    );

    List<TelegramPost> findByStatusOrderByReceivedAtDesc(
            String status
    );

    List<TelegramPost> findAllByOrderByReceivedAtDesc();

    Optional<TelegramPost> findByAffiliateUrl(
            String affiliateUrl
    );

    List<TelegramPost> findByProductId(Long productId);

    @Modifying
    @Query("UPDATE TelegramPost tp SET tp.product = null WHERE tp.product.id = :productId")
    void detachProduct(@Param("productId") Long productId);

    @Modifying
    @Query("UPDATE TelegramPost tp SET tp.product = null WHERE tp.product.id IN :productIds")
    void detachProductIn(@Param("productIds") List<Long> productIds);
}
