package com.onlineoffers.analytics;

import com.onlineoffers.repository.ProductClickRepository;
import org.springframework.stereotype.Service;

@Service
public class ClickAnalyticsService {

    private final ProductClickRepository productClickRepository;

    public ClickAnalyticsService(ProductClickRepository productClickRepository) {
        this.productClickRepository = productClickRepository;
    }

    public long getTotalClicks() {
        return productClickRepository.count();
    }
}
