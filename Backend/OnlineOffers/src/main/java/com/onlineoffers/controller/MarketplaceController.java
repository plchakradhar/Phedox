package com.onlineoffers.controller;

import com.onlineoffers.entity.Marketplace;
import com.onlineoffers.repository.MarketplaceRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplaces")
public class MarketplaceController {

    private final MarketplaceRepository marketplaceRepository;

    public MarketplaceController(MarketplaceRepository marketplaceRepository) {
        this.marketplaceRepository = marketplaceRepository;
    }

    @GetMapping
    public ResponseEntity<List<Marketplace>> getAllMarketplaces() {
        return ResponseEntity.ok(marketplaceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Marketplace> getMarketplaceById(
            @PathVariable Long id
    ) {
        return marketplaceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Marketplace> createMarketplace(
            @Valid @RequestBody Marketplace marketplace
    ) {
        if (marketplaceRepository.existsByNameIgnoreCase(marketplace.getName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        if (marketplaceRepository.existsByType(marketplace.getType())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Marketplace savedMarketplace = marketplaceRepository.save(marketplace);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedMarketplace);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Marketplace> updateMarketplace(
            @PathVariable Long id,
            @Valid @RequestBody Marketplace marketplace
    ) {
        return marketplaceRepository.findById(id)
                .map(existingMarketplace -> {
                    existingMarketplace.setName(marketplace.getName());
                    existingMarketplace.setType(marketplace.getType());
                    existingMarketplace.setWebsiteUrl(marketplace.getWebsiteUrl());
                    if (marketplace.getActive() != null) {
                        existingMarketplace.setActive(marketplace.getActive());
                    }

                    return ResponseEntity.ok(
                            marketplaceRepository.save(existingMarketplace)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMarketplace(
            @PathVariable Long id
    ) {
        if (!marketplaceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        marketplaceRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}