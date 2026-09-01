package com.onlineoffers.service;

import com.onlineoffers.dto.TelegramMessageRequest;
import com.onlineoffers.entity.TelegramPost;
import com.onlineoffers.repository.TelegramPostRepository;
import com.onlineoffers.telegram.TelegramLinkExtractor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TelegramService {

    private final TelegramPostRepository telegramPostRepository;

    private final TelegramLinkExtractor telegramLinkExtractor;

    public TelegramService(
            TelegramPostRepository telegramPostRepository,
            TelegramLinkExtractor telegramLinkExtractor
    ) {

        this.telegramPostRepository = telegramPostRepository;

        this.telegramLinkExtractor = telegramLinkExtractor;
    }

    /*
     * Receive a Telegram post.
     *
     * At this stage we only receive and store the post.
     *
     * Product creation/processing can happen in the
     * next processing step.
     */
    @Transactional
    public TelegramPost receivePost(
            TelegramMessageRequest request
    ) {

        /*
         * Validate channel ID.
         */
        if (
                request.getChannelId() == null ||
                request.getChannelId().isBlank()
        ) {

            throw new RuntimeException(
                    "Telegram channel ID is required"
            );
        }

        /*
         * Validate Telegram message ID.
         */
        if (request.getTelegramMessageId() == null) {

            throw new RuntimeException(
                    "Telegram message ID is required"
            );
        }

        /*
         * Prevent duplicate Telegram messages.
         */
        if (
                telegramPostRepository
                        .existsByChannelIdAndTelegramMessageId(
                                request.getChannelId(),
                                request.getTelegramMessageId()
                        )
        ) {

            throw new RuntimeException(
                    "Telegram post already processed"
            );
        }

        /*
         * Get affiliate URL from request.
         */
        String affiliateUrl = request.getAffiliateUrl();

        /*
         * If affiliate URL was not explicitly supplied,
         * extract the first URL from the Telegram message.
         */
        if (
                affiliateUrl == null ||
                affiliateUrl.isBlank()
        ) {

            affiliateUrl =
                    telegramLinkExtractor.extractFirstLink(
                            request.getMessageText()
                    );
        }

        /*
         * Affiliate URL is required.
         */
        if (
                affiliateUrl == null ||
                affiliateUrl.isBlank()
        ) {

            throw new RuntimeException(
                    "No affiliate URL found in Telegram post"
            );
        }

        /*
         * Create TelegramPost entity.
         */
        TelegramPost post = new TelegramPost();

        /*
         * Telegram information.
         */
        post.setTelegramMessageId(
                request.getTelegramMessageId()
        );

        post.setChannelId(
                request.getChannelId()
        );

        post.setChannelUsername(
                request.getChannelUsername()
        );

        /*
         * Original message text.
         */
        post.setMessageText(
                request.getMessageText()
        );

        /*
         * IMPORTANT:
         *
         * Store the exact affiliate URL.
         */
        post.setAffiliateUrl(
                affiliateUrl
        );

        /*
         * Initial state.
         */
        post.setStatus("RECEIVED");

        post.setProcessed(false);

        post.setSuccessful(false);

        post.setProcessingMessage(
                "Telegram post received"
        );

        post.setErrorMessage(null);

        /*
         * We don't yet have a separate Telegram posted_at
         * timestamp from the request.
         *
         * Therefore use current time.
         */
        LocalDateTime now = LocalDateTime.now();

        post.setReceivedAt(now);

        post.setPostedAt(now);

        /*
         * processedAt must remain NULL because
         * processing has not happened yet.
         */
        post.setProcessedAt(null);

        /*
         * Save.
         */
        return telegramPostRepository.save(post);
    }

    /*
     * Get all Telegram posts.
     */
    public List<TelegramPost> getAllPosts() {

        return telegramPostRepository
                .findAllByOrderByReceivedAtDesc();
    }

    /*
     * Get posts by status.
     */
    public List<TelegramPost> getPostsByStatus(
            String status
    ) {

        return telegramPostRepository
                .findByStatusOrderByReceivedAtDesc(
                        status
                );
    }

    /*
     * Get Telegram post by ID.
     */
    public TelegramPost getPostById(Long id) {

        return telegramPostRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Telegram post not found"
                        )
                );
    }

    /*
     * Mark Telegram post as PROCESSING.
     */
    @Transactional
    public TelegramPost markAsProcessing(
            Long id
    ) {

        TelegramPost post = getPostById(id);

        post.setStatus("PROCESSING");

        post.setProcessed(false);

        post.setSuccessful(false);

        post.setProcessingMessage(
                "Processing Telegram post"
        );

        post.setErrorMessage(null);

        return telegramPostRepository.save(post);
    }

    /*
     * Mark Telegram post as successfully processed.
     */
    @Transactional
    public TelegramPost markAsProcessed(
            Long id
    ) {

        TelegramPost post = getPostById(id);

        post.setStatus("PROCESSED");

        post.setProcessed(true);

        post.setSuccessful(true);

        post.setProcessingMessage(
                "Telegram post processed successfully"
        );

        post.setProcessedAt(
                LocalDateTime.now()
        );

        post.setErrorMessage(null);

        return telegramPostRepository.save(post);
    }

    /*
     * Mark Telegram post as failed.
     */
    @Transactional
    public TelegramPost markAsFailed(
            Long id,
            String errorMessage
    ) {

        TelegramPost post = getPostById(id);

        post.setStatus("FAILED");

        post.setProcessed(true);

        post.setSuccessful(false);

        post.setProcessingMessage(
                "Telegram post processing failed"
        );

        post.setErrorMessage(
                errorMessage
        );

        post.setProcessedAt(
                LocalDateTime.now()
        );

        return telegramPostRepository.save(post);
    }
}