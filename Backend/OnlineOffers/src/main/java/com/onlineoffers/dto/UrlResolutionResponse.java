package com.onlineoffers.dto;

public class UrlResolutionResponse {

    private String affiliateUrl;

    private String resolvedProductUrl;

    private String marketplace;

    private boolean resolved;

    private String message;

    public UrlResolutionResponse() {
    }

    public UrlResolutionResponse(
            String affiliateUrl,
            String resolvedProductUrl,
            String marketplace,
            boolean resolved,
            String message
    ) {
        this.affiliateUrl = affiliateUrl;
        this.resolvedProductUrl = resolvedProductUrl;
        this.marketplace = marketplace;
        this.resolved = resolved;
        this.message = message;
    }

    public String getAffiliateUrl() {
        return affiliateUrl;
    }

    public void setAffiliateUrl(String affiliateUrl) {
        this.affiliateUrl = affiliateUrl;
    }

    public String getResolvedProductUrl() {
        return resolvedProductUrl;
    }

    public void setResolvedProductUrl(String resolvedProductUrl) {
        this.resolvedProductUrl = resolvedProductUrl;
    }

    public String getMarketplace() {
        return marketplace;
    }

    public void setMarketplace(String marketplace) {
        this.marketplace = marketplace;
    }

    public boolean isResolved() {
        return resolved;
    }

    public void setResolved(boolean resolved) {
        this.resolved = resolved;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}