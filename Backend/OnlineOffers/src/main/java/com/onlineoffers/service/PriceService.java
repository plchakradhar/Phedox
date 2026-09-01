package com.onlineoffers.service;

import com.onlineoffers.entity.Product;
import com.onlineoffers.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PriceService {

    private final ProductRepository productRepository;

    public PriceService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional
    public void updateProductPrice(Long productId, BigDecimal newPrice) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setCurrentPrice(newPrice);
        if (product.getLowestPrice() == null || newPrice.compareTo(product.getLowestPrice()) < 0) {
            product.setLowestPrice(newPrice);
        }
        product.setLastCheckedAt(LocalDateTime.now());
        productRepository.save(product);
    }
}
