package com.onlineoffers.util;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class DiscountCalculator {

    public BigDecimal calculateDiscountPercentage(BigDecimal originalPrice, BigDecimal currentPrice) {
        if (originalPrice == null || currentPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (currentPrice.compareTo(originalPrice) >= 0) {
            return BigDecimal.ZERO;
        }
        return originalPrice.subtract(currentPrice)
                .multiply(BigDecimal.valueOf(100))
                .divide(originalPrice, 2, RoundingMode.HALF_UP);
    }

    public boolean isHotDeal(BigDecimal discountPercentage, BigDecimal minimumThreshold) {
        if (discountPercentage == null || minimumThreshold == null) return false;
        return discountPercentage.compareTo(minimumThreshold) >= 0;
    }
}
