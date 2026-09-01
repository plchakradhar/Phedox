package com.onlineoffers.service;

import com.onlineoffers.dto.ProductRequest;
import com.onlineoffers.dto.ProductResponse;
import com.onlineoffers.entity.Category;
import com.onlineoffers.entity.Marketplace;
import com.onlineoffers.entity.Product;
import com.onlineoffers.enums.ProductStatus;
import com.onlineoffers.enums.StockStatus;
import com.onlineoffers.mapper.ProductMapper;
import com.onlineoffers.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MarketplaceRepository marketplaceRepository;
    private final ProductReviewRepository productReviewRepository;
    private final ProductClickRepository productClickRepository;
    private final TelegramPostRepository telegramPostRepository;
    private final ScrapingLogRepository scrapingLogRepository;
    private final ImageStorageService imageStorageService;
    private final ProductMapper productMapper;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            MarketplaceRepository marketplaceRepository,
            ProductReviewRepository productReviewRepository,
            ProductClickRepository productClickRepository,
            TelegramPostRepository telegramPostRepository,
            ScrapingLogRepository scrapingLogRepository,
            ImageStorageService imageStorageService,
            ProductMapper productMapper
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.marketplaceRepository = marketplaceRepository;
        this.productReviewRepository = productReviewRepository;
        this.productClickRepository = productClickRepository;
        this.telegramPostRepository = telegramPostRepository;
        this.scrapingLogRepository = scrapingLogRepository;
        this.imageStorageService = imageStorageService;
        this.productMapper = productMapper;
    }

    public List<ProductResponse> getAllActiveProducts() {
        return productRepository
                .findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    public List<ProductResponse> getFilteredProducts(Long categoryId, Long marketplaceId, BigDecimal minDiscount, String search) {
        List<Product> products = productRepository.findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE);

        return products.stream()
                .filter(p -> categoryId == null || (p.getCategory() != null && p.getCategory().getId().equals(categoryId)))
                .filter(p -> marketplaceId == null || (p.getMarketplace() != null && p.getMarketplace().getId().equals(marketplaceId)))
                .filter(p -> minDiscount == null || (p.getDiscountPercentage() != null && p.getDiscountPercentage().compareTo(minDiscount) >= 0))
                .filter(p -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase().trim();
                    String name = p.getName() != null ? p.getName().toLowerCase() : "";
                    String desc = p.getDescription() != null ? p.getDescription().toLowerCase() : "";
                    String catName = (p.getCategory() != null && p.getCategory().getName() != null) ? p.getCategory().getName().toLowerCase() : "";
                    return name.contains(s) || desc.contains(s) || catName.contains(s);
                })
                .map(productMapper::toResponse)
                .toList();
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (request.getAffiliateUrl() != null && productRepository.existsByAffiliateUrl(request.getAffiliateUrl())) {
            throw new RuntimeException("Product with this affiliate link already exists");
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setProductUrl(request.getProductUrl() != null ? request.getProductUrl() : request.getAffiliateUrl());
        product.setAffiliateUrl(request.getAffiliateUrl());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setCurrentPrice(request.getCurrentPrice());
        product.setHighestPrice(request.getHighestPrice() != null ? request.getHighestPrice() : request.getOriginalPrice());
        product.setAveragePrice(request.getAveragePrice() != null ? request.getAveragePrice() : request.getCurrentPrice());
        product.setLowestPrice(request.getLowestPrice() != null ? request.getLowestPrice() : request.getCurrentPrice());
        product.setDiscountPercentage(request.getDiscountPercentage());

        if (request.getRating() != null) product.setRating(request.getRating());
        if (request.getRatingCount() != null) product.setRatingCount(request.getRatingCount());
        if (request.getStockStatus() != null) product.setStockStatus(StockStatus.valueOf(request.getStockStatus()));
        if (request.getStatus() != null) product.setStatus(ProductStatus.valueOf(request.getStatus()));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        if (request.getMarketplaceId() != null) {
            Marketplace marketplace = marketplaceRepository.findById(request.getMarketplaceId())
                    .orElseThrow(() -> new RuntimeException("Marketplace not found"));
            product.setMarketplace(marketplace);
        }

        product.setExpiresAt(LocalDateTime.now().plusHours(32));
        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getOriginalPrice() != null) product.setOriginalPrice(request.getOriginalPrice());
        if (request.getCurrentPrice() != null) product.setCurrentPrice(request.getCurrentPrice());
        if (request.getHighestPrice() != null) product.setHighestPrice(request.getHighestPrice());
        if (request.getAveragePrice() != null) product.setAveragePrice(request.getAveragePrice());
        if (request.getLowestPrice() != null) product.setLowestPrice(request.getLowestPrice());
        if (request.getDiscountPercentage() != null) product.setDiscountPercentage(request.getDiscountPercentage());
        if (request.getAffiliateUrl() != null) product.setAffiliateUrl(request.getAffiliateUrl());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        if (request.getMarketplaceId() != null) {
            Marketplace marketplace = marketplaceRepository.findById(request.getMarketplaceId())
                    .orElseThrow(() -> new RuntimeException("Marketplace not found"));
            product.setMarketplace(marketplace);
        }

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Transactional
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        imageStorageService.deleteImagesForProduct(id);
        productReviewRepository.deleteByProductId(id);
        productClickRepository.deleteByProductId(id);
        telegramPostRepository.detachProduct(id);
        scrapingLogRepository.detachProduct(id);
        productRepository.delete(product);
    }
}