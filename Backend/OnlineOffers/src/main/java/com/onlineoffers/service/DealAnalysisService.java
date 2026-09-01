package com.onlineoffers.service;

import com.onlineoffers.dto.DealAnalysisResponse;
import com.onlineoffers.util.DiscountCalculator;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DealAnalysisService {

    private final DiscountCalculator discountCalculator;

    public DealAnalysisService(DiscountCalculator discountCalculator) {
        this.discountCalculator = discountCalculator;
    }

    public DealAnalysisResponse analyzeDeal(BigDecimal originalPrice, BigDecimal currentPrice) {
        if (originalPrice == null || currentPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return new DealAnalysisResponse(false, BigDecimal.ZERO, BigDecimal.ZERO, "INVALID");
        }

        BigDecimal discount = discountCalculator.calculateDiscountPercentage(originalPrice, currentPrice);
        BigDecimal savings = originalPrice.subtract(currentPrice);
        boolean isWorth = discount.compareTo(BigDecimal.valueOf(50)) >= 0;

        String rating = "NORMAL";
        if (discount.compareTo(BigDecimal.valueOf(70)) >= 0) {
            rating = "SUPER_HOT";
        } else if (discount.compareTo(BigDecimal.valueOf(50)) >= 0) {
            rating = "HOT";
        }

        return new DealAnalysisResponse(isWorth, discount, savings, rating);
    }
}
