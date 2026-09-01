package com.onlineoffers.service;

import com.onlineoffers.entity.Marketplace;
import com.onlineoffers.enums.MarketplaceType;
import com.onlineoffers.repository.MarketplaceRepository;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.List;
import java.util.Locale;

@Service
public class MarketplaceService {

    private final MarketplaceRepository marketplaceRepository;

    public MarketplaceService(MarketplaceRepository marketplaceRepository) {
        this.marketplaceRepository = marketplaceRepository;
    }

    /**
     * Detect marketplace from URL accurately matching domain names, short links, and subdomains.
     */
    public MarketplaceType detectMarketplaceType(String url) {
        if (url == null || url.isBlank()) {
            return MarketplaceType.OTHER;
        }

        String lower = url.toLowerCase(Locale.ROOT);

        if (lower.contains("amazon") || lower.contains("amzn.") || lower.contains("a.co/") || lower.contains("z.cn")) {
            return MarketplaceType.AMAZON;
        }
        if (lower.contains("flipkart") || lower.contains("fkrt.it") || lower.contains("fkrt.co")) {
            return MarketplaceType.FLIPKART;
        }
        if (lower.contains("myntra")) {
            return MarketplaceType.MYNTRA;
        }
        if (lower.contains("meesho")) {
            return MarketplaceType.MEESHO;
        }
        if (lower.contains("ajio")) {
            return MarketplaceType.AJIO;
        }
        if (lower.contains("croma")) {
            return MarketplaceType.CROMA;
        }
        if (lower.contains("tatacliq") || lower.contains("tata-cliq")) {
            return MarketplaceType.TATACLIQ;
        }
        if (lower.contains("nykaa")) {
            return MarketplaceType.NYKAA;
        }
        if (lower.contains("jiomart")) {
            return MarketplaceType.JIOMART;
        }
        if (lower.contains("snapdeal")) {
            return MarketplaceType.SNAPDEAL;
        }
        if (lower.contains("shopsy")) {
            return MarketplaceType.SHOPSY;
        }

        return MarketplaceType.OTHER;
    }

    public Marketplace findMarketplace(String url) {
        MarketplaceType type = detectMarketplaceType(url);
        return marketplaceRepository.findByType(type)
                .orElseGet(() -> {
                    // Create marketplace dynamically if missing
                    Marketplace m = new Marketplace();
                    m.setType(type);
                    m.setName(formatMarketplaceName(type));
                    m.setWebsiteUrl(getBaseUrlForType(type));
                    m.setActive(true);
                    return marketplaceRepository.save(m);
                });
    }

    private String formatMarketplaceName(MarketplaceType type) {
        return switch (type) {
            case AMAZON -> "Amazon";
            case FLIPKART -> "Flipkart";
            case MYNTRA -> "Myntra";
            case MEESHO -> "Meesho";
            case AJIO -> "Ajio";
            case CROMA -> "Croma";
            case TATACLIQ -> "Tata CLiQ";
            case NYKAA -> "Nykaa";
            case JIOMART -> "JioMart";
            case SNAPDEAL -> "Snapdeal";
            case SHOPSY -> "Shopsy";
            default -> "Online Store";
        };
    }

    private String getBaseUrlForType(MarketplaceType type) {
        return switch (type) {
            case AMAZON -> "https://www.amazon.in";
            case FLIPKART -> "https://www.flipkart.com";
            case MYNTRA -> "https://www.myntra.com";
            case MEESHO -> "https://www.meesho.com";
            case AJIO -> "https://www.ajio.com";
            case CROMA -> "https://www.croma.com";
            case TATACLIQ -> "https://www.tatacliq.com";
            case NYKAA -> "https://www.nykaa.com";
            case JIOMART -> "https://www.jiomart.com";
            case SNAPDEAL -> "https://www.snapdeal.com";
            case SHOPSY -> "https://www.shopsy.in";
            default -> "https://www.google.com";
        };
    }

    public List<Marketplace> getActiveMarketplaces() {
        return marketplaceRepository.findAll()
                .stream()
                .filter(Marketplace::getActive)
                .toList();
    }
}