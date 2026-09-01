package com.onlineoffers.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "telegram_posts",
        indexes = {

                @Index(
                        name = "idx_telegram_message_id",
                        columnList = "telegram_message_id"
                ),

                @Index(
                        name = "idx_telegram_channel_id",
                        columnList = "channel_id"
                ),

                @Index(
                        name = "idx_telegram_status",
                        columnList = "status"
                ),

                @Index(
                        name = "idx_telegram_received_at",
                        columnList = "received_at"
                )

        },

        uniqueConstraints = {

                @UniqueConstraint(
                        name = "uk_telegram_channel_message",
                        columnNames = {
                                "channel_id",
                                "telegram_message_id"
                        }
                )

        }
)
public class TelegramPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Telegram message ID.
     */
    @Column(
            name = "telegram_message_id",
            nullable = false
    )
    private Long telegramMessageId;

    /*
     * Telegram channel ID.
     */
    @Column(
            name = "channel_id",
            nullable = false,
            length = 100
    )
    private String channelId;

    /*
     * Telegram channel username.
     */
    @Column(
            name = "channel_username",
            length = 200
    )
    private String channelUsername;

    /*
     * Original Telegram message text.
     */
    @Column(
            name = "message_text",
            columnDefinition = "TEXT"
    )
    private String messageText;

    /*
     * Exact affiliate URL received from Telegram.
     *
     * Never modify or reconstruct this URL.
     */
    @Column(
            name = "affiliate_url",
            nullable = false,
            length = 2000
    )
    private String affiliateUrl;

    /*
     * Marketplace detected from the Telegram post.
     *
     * Example:
     * Flipkart
     * Amazon
     */
    @Column(
            name = "marketplace",
            length = 100
    )
    private String marketplace;

    /*
     * Current processing status.
     *
     * RECEIVED
     * PROCESSING
     * PROCESSED
     * FAILED
     */
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private String status = "RECEIVED";

    /*
     * Whether processing has finished.
     *
     * false = still not processed
     * true  = processing finished
     */
    @Column(
            name = "processed",
            nullable = false
    )
    private boolean processed = false;

    /*
     * Whether processing was successful.
     */
    @Column(
            name = "successful",
            nullable = false
    )
    private boolean successful = false;

    /*
     * Processing information/message.
     */
    @Column(
            name = "processing_message",
            length = 1000
    )
    private String processingMessage;

    /*
     * Error message when processing fails.
     */
    @Column(
            name = "error_message",
            length = 1000
    )
    private String errorMessage;

    /*
     * Product created/associated from this Telegram post.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    /*
     * Time when Telegram post was received by our application.
     */
    @Column(
            name = "received_at",
            nullable = false
    )
    private LocalDateTime receivedAt;

    /*
     * Time when the Telegram post was processed.
     */
    @Column(
            name = "processed_at"
    )
    private LocalDateTime processedAt;

    /*
     * Original/posting time of the Telegram message.
     *
     * If the actual Telegram posting time is not available,
     * we use the received time.
     */
    @Column(
            name = "posted_at",
            nullable = false
    )
    private LocalDateTime postedAt;

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (receivedAt == null) {
            receivedAt = now;
        }

        if (postedAt == null) {
            postedAt = receivedAt;
        }

        if (status == null || status.isBlank()) {
            status = "RECEIVED";
        }

        /*
         * Important:
         * These values must never be NULL because
         * PostgreSQL requires them.
         */
        processed = false;
        successful = false;
    }

    public TelegramPost() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTelegramMessageId() {
        return telegramMessageId;
    }

    public void setTelegramMessageId(Long telegramMessageId) {
        this.telegramMessageId = telegramMessageId;
    }

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

    public String getChannelUsername() {
        return channelUsername;
    }

    public void setChannelUsername(String channelUsername) {
        this.channelUsername = channelUsername;
    }

    public String getMessageText() {
        return messageText;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
    }

    public String getAffiliateUrl() {
        return affiliateUrl;
    }

    public void setAffiliateUrl(String affiliateUrl) {
        this.affiliateUrl = affiliateUrl;
    }

    public String getMarketplace() {
        return marketplace;
    }

    public void setMarketplace(String marketplace) {
        this.marketplace = marketplace;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isProcessed() {
        return processed;
    }

    public void setProcessed(boolean processed) {
        this.processed = processed;
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public String getProcessingMessage() {
        return processingMessage;
    }

    public void setProcessingMessage(String processingMessage) {
        this.processingMessage = processingMessage;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(LocalDateTime receivedAt) {
        this.receivedAt = receivedAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public LocalDateTime getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(LocalDateTime postedAt) {
        this.postedAt = postedAt;
    }
}