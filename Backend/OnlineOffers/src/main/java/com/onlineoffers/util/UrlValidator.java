package com.onlineoffers.util;

import org.springframework.stereotype.Component;

import java.net.URI;

@Component
public class UrlValidator {

    public boolean isValidUrl(String url) {
        if (url == null || url.isBlank()) return false;
        try {
            URI uri = URI.create(url.trim());
            return uri.getScheme() != null && (uri.getScheme().equalsIgnoreCase("http") || uri.getScheme().equalsIgnoreCase("https"));
        } catch (Exception e) {
            return false;
        }
    }
}
