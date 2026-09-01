package com.onlineoffers.repository;

import com.onlineoffers.entity.Marketplace;
import com.onlineoffers.enums.MarketplaceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketplaceRepository extends JpaRepository<Marketplace, Long> {

    Optional<Marketplace> findByNameIgnoreCase(String name);

    Optional<Marketplace> findByType(MarketplaceType type);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByType(MarketplaceType type);
}