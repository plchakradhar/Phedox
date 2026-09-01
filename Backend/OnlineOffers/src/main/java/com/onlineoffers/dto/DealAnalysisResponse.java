package com.onlineoffers.dto;

import java.math.BigDecimal;

public class DealAnalysisResponse {

    private boolean isWorth;
    private BigDecimal discountPercentage;
    private BigDecimal savingsAmount;
    private String dealRating; // "HOT", "SUPER_HOT", "NORMAL"

    public DealAnalysisResponse() {
    }

    public DealAnalysisResponse(boolean isWorth, BigDecimal discountPercentage, BigDecimal savingsAmount, String dealRating) {
        this.isWorth = isWorth;
        this.discountPercentage = discountPercentage;
        this.savingsAmount = savingsAmount;
        this.dealRating = dealRating;
    }

    public boolean isWorth() {
        return isWorth;
    }

    public void setWorth(boolean worth) {
        isWorth = worth;
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public BigDecimal getSavingsAmount() {
        return savingsAmount;
    }

    public void setSavingsAmount(BigDecimal savingsAmount) {
        this.savingsAmount = savingsAmount;
    }

    public String getDealRating() {
        return dealRating;
    }

    public void setDealRating(String dealRating) {
        this.dealRating = dealRating;
    }
}
