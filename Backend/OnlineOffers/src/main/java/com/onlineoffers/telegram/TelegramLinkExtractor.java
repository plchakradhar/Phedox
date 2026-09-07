package com.onlineoffers.telegram;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class TelegramLinkExtractor {

    private static final Pattern STANDARD_URL_PATTERN = Pattern.compile(
            "(https?://[^\\s<>\"'\\[\\]()]+)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern DOMAIN_URL_PATTERN = Pattern.compile(
            "\\b((?:www\\.)?(?:amzn\\.(?:to|in)|fkrt\\.(?:it|co)|extrape\\.com|bit\\.ly|cutt\\.ly|tinyurl\\.com|amazon\\.(?:in|com)|flipkart\\.com|myntra\\.com|meesho\\.com|ajio\\.com|shopsy\\.in|tatacliq\\.com|croma\\.com|nykaa\\.com|jiomart\\.com|snapdeal\\.com)/[^\\s<>\"'\\[\\]()]+)",
            Pattern.CASE_INSENSITIVE
    );

    public List<String> extractLinks(String text) {
        List<String> links = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return links;
        }

        // 1. Standard http(s) URLs
        Matcher matcher = STANDARD_URL_PATTERN.matcher(text);
        while (matcher.find()) {
            String url = cleanUrl(matcher.group(1));
            if (!url.isBlank() && !links.contains(url)) {
                links.add(url);
            }
        }

        // 2. Domain URLs without explicit protocol (e.g. amzn.to/3xyz)
        Matcher domainMatcher = DOMAIN_URL_PATTERN.matcher(text);
        while (domainMatcher.find()) {
            String rawUrl = domainMatcher.group(1);
            String url = cleanUrl(rawUrl);
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }
            if (!url.isBlank() && !links.contains(url)) {
                links.add(url);
            }
        }

        return links;
    }

    public String extractFirstLink(String text) {
        List<String> links = extractLinks(text);
        if (links.isEmpty()) {
            return null;
        }
        return links.get(0);
    }

    private String cleanUrl(String url) {
        if (url == null) {
            return "";
        }
        return url
                .trim()
                .replaceAll("[),.!?;:\\]\\[]+$", "");
    }
}