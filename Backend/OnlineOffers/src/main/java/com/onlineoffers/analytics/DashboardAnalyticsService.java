package com.onlineoffers.analytics;

import com.onlineoffers.dto.AnalyticsResponse;
import com.onlineoffers.service.AnalyticsService;
import org.springframework.stereotype.Service;

@Service
public class DashboardAnalyticsService {

    private final AnalyticsService analyticsService;

    public DashboardAnalyticsService(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    public AnalyticsResponse getDashboardSummary() {
        return analyticsService.getDashboardAnalytics();
    }
}
