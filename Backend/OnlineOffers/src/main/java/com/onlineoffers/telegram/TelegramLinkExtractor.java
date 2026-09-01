package com.onlineoffers.telegram;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class TelegramLinkExtractor {

    private static final Pattern URL_PATTERN = Pattern.compile(
            "(https?://[^\\s<>\"']+)",
            Pattern.CASE_INSENSITIVE
    );

    public List<String> extractLinks(String text) {

        List<String> links = new ArrayList<>();

        if (text == null || text.isBlank()) {
            return links;
        }

        Matcher matcher = URL_PATTERN.matcher(text);

        while (matcher.find()) {

            String url = matcher.group(1);

            url = cleanUrl(url);

            if (!url.isBlank()) {
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
                .replaceAll("[),.!?;:]+$", "");
    }
}