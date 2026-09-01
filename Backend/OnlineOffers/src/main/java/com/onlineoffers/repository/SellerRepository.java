package com.onlineoffers.repository;

import com.onlineoffers.entity.Marketplace;
import com.onlineoffers.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {

    Optional<Seller> findByNameIgnoreCaseAndMarketplace(
            String name,
            Marketplace marketplace
    );

    List<Seller> findByMarketplace(Marketplace marketplace);

    boolean existsByNameIgnoreCaseAndMarketplace(
            String name,
            Marketplace marketplace
    );
}