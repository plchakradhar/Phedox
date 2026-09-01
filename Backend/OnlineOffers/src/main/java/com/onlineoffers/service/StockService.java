package com.onlineoffers.service;

import com.onlineoffers.entity.Product;
import com.onlineoffers.enums.ProductStatus;
import com.onlineoffers.enums.StockStatus;
import com.onlineoffers.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class StockService {

    private final ProductRepository productRepository;

    public StockService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional
    public void markOutOfStock(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStockStatus(StockStatus.OUT_OF_STOCK);
        product.setStatus(ProductStatus.OUT_OF_STOCK);
        product.setLastCheckedAt(LocalDateTime.now());
        productRepository.save(product);
    }
}
