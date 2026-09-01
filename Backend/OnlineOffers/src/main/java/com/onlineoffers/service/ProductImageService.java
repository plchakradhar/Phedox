package com.onlineoffers.service;

import com.onlineoffers.entity.Product;
import com.onlineoffers.entity.ProductImage;
import com.onlineoffers.repository.ProductImageRepository;
import com.onlineoffers.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;

    public ProductImageService(
            ProductImageRepository productImageRepository,
            ProductRepository productRepository
    ) {
        this.productImageRepository = productImageRepository;
        this.productRepository = productRepository;
    }

    public List<ProductImage> getProductImages(Long productId) {

        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found");
        }

        return productImageRepository
                .findByProductIdOrderByDisplayOrderAsc(productId);
    }

    public ProductImage addImage(
            Long productId,
            String imageUrl,
            String originalImageUrl,
            boolean primary,
            int displayOrder
    ) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found")
                );

        if (primary) {
            productImageRepository
                    .findByProductIdAndIsPrimaryTrue(productId)
                    .ifPresent(existing -> {
                        existing.setIsPrimary(false);
                        productImageRepository.save(existing);
                    });
        }

        ProductImage image = new ProductImage();

        image.setProduct(product);
        image.setImageUrl(imageUrl);
        image.setOriginalImageUrl(originalImageUrl);
        image.setIsPrimary(primary);
        image.setDisplayOrder(displayOrder);

        return productImageRepository.save(image);
    }

    public void deleteImage(Long imageId) {

        if (!productImageRepository.existsById(imageId)) {
            throw new RuntimeException("Image not found");
        }

        productImageRepository.deleteById(imageId);
    }
}