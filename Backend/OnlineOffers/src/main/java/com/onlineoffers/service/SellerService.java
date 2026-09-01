package com.onlineoffers.service;

import com.onlineoffers.entity.Marketplace;
import com.onlineoffers.entity.Seller;
import com.onlineoffers.repository.MarketplaceRepository;
import com.onlineoffers.repository.SellerRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SellerService {

    private final SellerRepository sellerRepository;
    private final MarketplaceRepository marketplaceRepository;

    public SellerService(SellerRepository sellerRepository, MarketplaceRepository marketplaceRepository) {
        this.sellerRepository = sellerRepository;
        this.marketplaceRepository = marketplaceRepository;
    }

    public Optional<Seller> findByNameAndMarketplace(String name, Long marketplaceId) {
        Optional<Marketplace> marketplace = marketplaceRepository.findById(marketplaceId);
        return marketplace.flatMap(m -> sellerRepository.findByNameIgnoreCaseAndMarketplace(name, m));
    }
}
