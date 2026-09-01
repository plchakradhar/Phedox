package com.onlineoffers.service;

import com.onlineoffers.dto.AnalyticsResponse;
import com.onlineoffers.dto.ProductResponse;
import com.onlineoffers.entity.Product;
import com.onlineoffers.enums.ProductStatus;
import com.onlineoffers.mapper.ProductMapper;
import com.onlineoffers.repository.CategoryRepository;
import com.onlineoffers.repository.MarketplaceRepository;
import com.onlineoffers.repository.ProductClickRepository;
import com.onlineoffers.repository.ProductRepository;
import com.onlineoffers.repository.TelegramPostRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final ProductRepository productRepository;
    private final ProductClickRepository productClickRepository;
    private final TelegramPostRepository telegramPostRepository;
    private final CategoryRepository categoryRepository;
    private final MarketplaceRepository marketplaceRepository;
    private final ProductMapper productMapper;

    public AnalyticsService(
            ProductRepository productRepository,
            ProductClickRepository productClickRepository,
            TelegramPostRepository telegramPostRepository,
            CategoryRepository categoryRepository,
            MarketplaceRepository marketplaceRepository,
            ProductMapper productMapper
    ) {
        this.productRepository = productRepository;
        this.productClickRepository = productClickRepository;
        this.telegramPostRepository = telegramPostRepository;
        this.categoryRepository = categoryRepository;
        this.marketplaceRepository = marketplaceRepository;
        this.productMapper = productMapper;
    }

    public AnalyticsResponse getDashboardAnalytics() {
        AnalyticsResponse response = new AnalyticsResponse();

        List<Product> activeProducts = productRepository.findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE);
        response.setTotalActiveProducts(activeProducts.size());
        response.setTotalClicks(productClickRepository.count());
        response.setTotalTelegramPosts(telegramPostRepository.count());

        // Top 10 newest hot deals
        List<ProductResponse> topDeals = activeProducts.stream()
                .limit(10)
                .map(productMapper::toResponse)
                .toList();
        response.setTopDeals(topDeals);

        // Category breakdown
        Map<String, Long> catMap = new HashMap<>();
        categoryRepository.findAll().forEach(c -> {
            long count = activeProducts.stream().filter(p -> p.getCategory() != null && p.getCategory().getId().equals(c.getId())).count();
            catMap.put(c.getName(), count);
        });
        response.setCategoryBreakdown(catMap);

        // Marketplace breakdown
        Map<String, Long> marketMap = new HashMap<>();
        marketplaceRepository.findAll().forEach(m -> {
            long count = activeProducts.stream().filter(p -> p.getMarketplace() != null && p.getMarketplace().getId().equals(m.getId())).count();
            marketMap.put(m.getName(), count);
        });
        response.setMarketplaceBreakdown(marketMap);

        return response;
    }
}
