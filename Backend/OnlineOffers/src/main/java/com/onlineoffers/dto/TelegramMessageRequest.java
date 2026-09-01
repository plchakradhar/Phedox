package com.onlineoffers.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TelegramMessageRequest {

    private Long telegramMessageId;

    @Size(max = 100, message = "Channel ID cannot exceed 100 characters")
    private String channelId;

    @Size(max = 100, message = "Channel username cannot exceed 100 characters")
    private String channelUsername;

    @NotBlank(message = "Message text is required")
    @Size(max = 10000, message = "Message text cannot exceed 10000 characters")
    private String messageText;

    @Size(max = 2000, message = "Affiliate URL cannot exceed 2000 characters")
    private String affiliateUrl;

    public TelegramMessageRequest() {
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
}