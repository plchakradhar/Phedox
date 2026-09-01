package com.onlineoffers.util;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class PriceCalculator {

    public BigDecimal calculateAverage(BigDecimal high, BigDecimal low) {
        if (high == null && low == null) return BigDecimal.ZERO;
        if (high == null) return low;
        if (low == null) return high;
        return high.add(low).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
    }
}
