package com.onlineoffers.mapper;

import com.onlineoffers.dto.ProductResponse;
import com.onlineoffers.dto.ProductReviewDto;
import com.onlineoffers.entity.Product;
import com.onlineoffers.entity.ProductImage;
import com.onlineoffers.entity.ProductReview;
import com.onlineoffers.repository.ProductImageRepository;
import com.onlineoffers.repository.ProductReviewRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductMapper {

    private final ProductImageRepository productImageRepository;
    private final ProductReviewRepository productReviewRepository;

    public ProductMapper(ProductImageRepository productImageRepository, ProductReviewRepository productReviewRepository) {
        this.productImageRepository = productImageRepository;
        this.productReviewRepository = productReviewRepository;
    }

    private String resolveImageUrl(ProductImage img) {
        if (img == null) return null;
        if (img.getOriginalImageUrl() != null && !img.getOriginalImageUrl().isBlank() && img.getOriginalImageUrl().startsWith("http")) {
            return img.getOriginalImageUrl();
        }
        return img.getImageUrl();
    }

    public ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();

        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }

        if (product.getMarketplace() != null) {
            response.setMarketplaceId(product.getMarketplace().getId());
            response.setMarketplaceName(product.getMarketplace().getName());
        }

        response.setOriginalPrice(product.getOriginalPrice());
        response.setCurrentPrice(product.getCurrentPrice());
        response.setHighestPrice(product.getHighestPrice());
        response.setAveragePrice(product.getAveragePrice());
        response.setLowestPrice(product.getLowestPrice());
        response.setDiscountPercentage(product.getDiscountPercentage());

        response.setRating(product.getRating());
        response.setRatingCount(product.getRatingCount());

        response.setStockStatus(
                product.getStockStatus() != null
                        ? product.getStockStatus().name()
                        : null
        );

        response.setStatus(
                product.getStatus() != null
                        ? product.getStatus().name()
                        : null
        );

        response.setProductUrl(product.getProductUrl());
        response.setAffiliateUrl(product.getAffiliateUrl());
        response.setDealWorth(product.getDealWorth());

        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        response.setLastCheckedAt(product.getLastCheckedAt());

        // Images mapping
        if (product.getId() != null) {
            List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId());
            List<String> urls = images.stream()
                    .map(this::resolveImageUrl)
                    .filter(s -> s != null && !s.isBlank())
                    .toList();
            response.setImageUrls(urls);

            String primary = images.stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(this::resolveImageUrl)
                    .filter(s -> s != null && !s.isBlank())
                    .findFirst()
                    .orElse(urls.isEmpty() ? null : urls.get(0));
            response.setPrimaryImageUrl(primary);

            // Reviews mapping
            List<ProductReview> reviews = productReviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
            List<ProductReviewDto> reviewDtos = reviews.stream().map(r -> new ProductReviewDto(
                    r.getReviewerName(),
                    r.getRating(),
                    r.getReviewTitle(),
                    r.getComment(),
                    r.getReviewDate(),
                    r.getVerifiedPurchase()
            )).toList();
            response.setReviews(reviewDtos);
        }

        return response;
    }
}
