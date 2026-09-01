package com.onlineoffers.controller;

import com.onlineoffers.dto.TelegramMessageRequest;
import com.onlineoffers.entity.TelegramPost;
import com.onlineoffers.service.ProductProcessingService;
import com.onlineoffers.service.TelegramService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/telegram")
public class TelegramController {

    private final TelegramService telegramService;
    private final ProductProcessingService productProcessingService;

    public TelegramController(
            TelegramService telegramService,
            ProductProcessingService productProcessingService
    ) {
        this.telegramService = telegramService;
        this.productProcessingService = productProcessingService;
    }

    @PostMapping("/posts")
    public ResponseEntity<TelegramPost> receivePost(
            @Valid @RequestBody TelegramMessageRequest request
    ) {
        TelegramPost post = telegramService.receivePost(request);
        if (post != null && post.getId() != null) {
            try {
                productProcessingService.processTelegramPost(post.getId());
                post = telegramService.getPostById(post.getId());
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(post);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<TelegramPost>> getAllPosts() {
        return ResponseEntity.ok(telegramService.getAllPosts());
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<TelegramPost> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(telegramService.getPostById(id));
    }

    @PostMapping("/posts/{id}/process")
    public ResponseEntity<TelegramPost> processPost(@PathVariable Long id) {
        productProcessingService.processTelegramPost(id);
        return ResponseEntity.ok(telegramService.getPostById(id));
    }

    @GetMapping("/posts/status/{status}")
    public ResponseEntity<List<TelegramPost>> getPostsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(telegramService.getPostsByStatus(status));
    }
}