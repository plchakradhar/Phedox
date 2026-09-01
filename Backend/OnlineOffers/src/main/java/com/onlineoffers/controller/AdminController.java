package com.onlineoffers.controller;

import com.onlineoffers.dto.ProductResponse;
import com.onlineoffers.service.ProductProcessingService;
import com.onlineoffers.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProductService productService;
    private final ProductProcessingService productProcessingService;

    public AdminController(ProductService productService, ProductProcessingService productProcessingService) {
        this.productService = productService;
        this.productProcessingService = productProcessingService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @PostMapping("/telegram/process/{postId}")
    public ResponseEntity<Void> processTelegramPostManually(@PathVariable Long postId) {
        productProcessingService.processTelegramPost(postId);
        return ResponseEntity.ok().build();
    }
}
