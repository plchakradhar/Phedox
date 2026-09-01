package com.onlineoffers.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsResponse {

    private long totalActiveProducts;
    private long totalClicks;
    private long totalTelegramPosts;
    private List<ProductResponse> topDeals;
    private Map<String, Long> categoryBreakdown;
    private Map<String, Long> marketplaceBreakdown;

    public AnalyticsResponse() {
    }

    public long getTotalActiveProducts() {
        return totalActiveProducts;
    }

    public void setTotalActiveProducts(long totalActiveProducts) {
        this.totalActiveProducts = totalActiveProducts;
    }

    public long getTotalClicks() {
        return totalClicks;
    }

    public void setTotalClicks(long totalClicks) {
        this.totalClicks = totalClicks;
    }

    public long getTotalTelegramPosts() {
        return totalTelegramPosts;
    }

    public void setTotalTelegramPosts(long totalTelegramPosts) {
        this.totalTelegramPosts = totalTelegramPosts;
    }

    public List<ProductResponse> getTopDeals() {
        return topDeals;
    }

    public void setTopDeals(List<ProductResponse> topDeals) {
        this.topDeals = topDeals;
    }

    public Map<String, Long> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(Map<String, Long> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public Map<String, Long> getMarketplaceBreakdown() {
        return marketplaceBreakdown;
    }

    public void setMarketplaceBreakdown(Map<String, Long> marketplaceBreakdown) {
        this.marketplaceBreakdown = marketplaceBreakdown;
    }
}
