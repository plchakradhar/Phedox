package com.onlineoffers.mapper;

import com.onlineoffers.dto.MarketplaceResponse;
import com.onlineoffers.entity.Marketplace;
import org.springframework.stereotype.Component;

@Component
public class MarketplaceMapper {

    public MarketplaceResponse toResponse(Marketplace marketplace) {
        if (marketplace == null) return null;
        MarketplaceResponse res = new MarketplaceResponse();
        res.setId(marketplace.getId());
        res.setName(marketplace.getName());
        res.setType(marketplace.getType() != null ? marketplace.getType().name() : null);
        res.setWebsiteUrl(marketplace.getWebsiteUrl());
        res.setActive(marketplace.getActive());
        return res;
    }
}
