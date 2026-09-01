package com.onlineoffers.controller;

import com.onlineoffers.service.ClickTrackingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/clicks")
public class ClickController {

    private final ClickTrackingService clickTrackingService;

    public ClickController(ClickTrackingService clickTrackingService) {
        this.clickTrackingService = clickTrackingService;
    }

    /**
     * Redirects user to verified merchant partner deal while recording click analytics.
     */
    @GetMapping("/redirect/{productId}")
    public ResponseEntity<Void> redirectDeal(@PathVariable Long productId, HttpServletRequest request) {
        String affiliateUrl = clickTrackingService.trackClickAndGetRedirectUrl(productId, request);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(affiliateUrl));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
