package com.onlineoffers.analytics;

import com.onlineoffers.entity.Product;
import com.onlineoffers.enums.ProductStatus;
import com.onlineoffers.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductAnalyticsService {

    private final ProductRepository productRepository;

    public ProductAnalyticsService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE);
    }
}
