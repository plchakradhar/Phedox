package com.onlineoffers.controller;

import com.onlineoffers.dto.ProductRequest;
import com.onlineoffers.dto.ProductResponse;
import com.onlineoffers.service.ClickTrackingService;
import com.onlineoffers.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ClickTrackingService clickTrackingService;

    public ProductController(ProductService productService, ClickTrackingService clickTrackingService) {
        this.productService = productService;
        this.clickTrackingService = clickTrackingService;
    }

    /**
     * Get active products with optional search, category, marketplace, and discount filters.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long marketplaceId,
            @RequestParam(required = false) BigDecimal minDiscount,
            @RequestParam(required = false) String search
    ) {
        if (categoryId != null || marketplaceId != null || minDiscount != null || (search != null && !search.isBlank())) {
            return ResponseEntity.ok(productService.getFilteredProducts(categoryId, marketplaceId, minDiscount, search));
        }
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /**
     * Buy Now endpoint: Redirects immediately via HTTP 302 to verified affiliate merchant URL.
     */
    @GetMapping("/{id}/buy")
    public ResponseEntity<Void> buyProduct(@PathVariable Long id, HttpServletRequest request) {
        String affiliateUrl = clickTrackingService.trackClickAndGetRedirectUrl(id, request);
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(affiliateUrl));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}