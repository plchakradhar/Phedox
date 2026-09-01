package com.onlineoffers.controller;

import com.onlineoffers.entity.ProductImage;
import com.onlineoffers.service.ImageStorageService;
import com.onlineoffers.service.ProductImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductImageController {

    private final ProductImageService productImageService;
    private final ImageStorageService imageStorageService;

    public ProductImageController(
            ProductImageService productImageService,
            ImageStorageService imageStorageService
    ) {
        this.productImageService = productImageService;
        this.imageStorageService = imageStorageService;
    }

    @GetMapping("/{productId}/images")
    public ResponseEntity<List<ProductImage>> getProductImages(
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(
                productImageService.getProductImages(productId)
        );
    }

    @PostMapping("/{productId}/images")
    public ResponseEntity<ProductImage> addImage(
            @PathVariable Long productId,
            @RequestParam String imageUrl,
            @RequestParam(required = false) String originalImageUrl,
            @RequestParam(defaultValue = "false") boolean primary,
            @RequestParam(defaultValue = "0") int displayOrder
    ) {
        return ResponseEntity.ok(
                productImageService.addImage(
                        productId,
                        imageUrl,
                        originalImageUrl,
                        primary,
                        displayOrder
                )
        );
    }

    @PostMapping("/{productId}/images/download")
    public ResponseEntity<ProductImage> downloadImage(
            @PathVariable Long productId,
            @RequestParam String imageUrl,
            @RequestParam(defaultValue = "false") boolean primary,
            @RequestParam(defaultValue = "0") int displayOrder
    ) {
        ProductImage image =
                imageStorageService.downloadAndSaveImage(
                        productId,
                        imageUrl,
                        primary,
                        displayOrder
                );

        return ResponseEntity.ok(image);
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long imageId
    ) {
        productImageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}