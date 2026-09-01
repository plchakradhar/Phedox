package com.onlineoffers.controller;

import com.onlineoffers.dto.UrlResolutionResponse;
import com.onlineoffers.service.AffiliateUrlResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/url")
public class UrlResolverController {

    private final AffiliateUrlResolver affiliateUrlResolver;

    public UrlResolverController(AffiliateUrlResolver affiliateUrlResolver) {
        this.affiliateUrlResolver = affiliateUrlResolver;
    }

    @GetMapping("/resolve")
    public ResponseEntity<UrlResolutionResponse> resolveUrl(@RequestParam String url) {
        return ResponseEntity.ok(affiliateUrlResolver.resolve(url));
    }
}