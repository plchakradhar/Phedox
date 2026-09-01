package com.onlineoffers.dto;

import java.time.LocalDateTime;

public class ClickResponse {

    private Long id;
    private Long productId;
    private String affiliateUrl;
    private LocalDateTime clickedAt;

    public ClickResponse() {
    }

    public ClickResponse(Long id, Long productId, String affiliateUrl, LocalDateTime clickedAt) {
        this.id = id;
        this.productId = productId;
        this.affiliateUrl = affiliateUrl;
        this.clickedAt = clickedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getAffiliateUrl() {
        return affiliateUrl;
    }

    public void setAffiliateUrl(String affiliateUrl) {
        this.affiliateUrl = affiliateUrl;
    }

    public LocalDateTime getClickedAt() {
        return clickedAt;
    }

    public void setClickedAt(LocalDateTime clickedAt) {
        this.clickedAt = clickedAt;
    }
}
