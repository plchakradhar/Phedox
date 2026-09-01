package com.onlineoffers.service;

import com.onlineoffers.dto.UrlResolutionResponse;
import com.onlineoffers.enums.MarketplaceType;
import com.onlineoffers.security.IpSecurityValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AffiliateUrlResolver {

    private static final Logger log = LoggerFactory.getLogger(AffiliateUrlResolver.class);

    private static final Pattern META_REFRESH_PATTERN = Pattern.compile(
            "<meta[^>]*?content=[\"'][^\"']*?url=([^\"'>]+)[\"']",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern JS_REDIRECT_PATTERN = Pattern.compile(
            "(?:window\\.location(?:\\.href)?|location\\.href|location\\.replace)\\s*=\\s*[\"'](https?://[^\"']+)[\"']",
            Pattern.CASE_INSENSITIVE
    );

    private final MarketplaceService marketplaceService;
    private final IpSecurityValidator ipSecurityValidator;
    private final HttpClient httpClient;

    public AffiliateUrlResolver(MarketplaceService marketplaceService, IpSecurityValidator ipSecurityValidator) {
        this.marketplaceService = marketplaceService;
        this.ipSecurityValidator = ipSecurityValidator;
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public UrlResolutionResponse resolve(String affiliateUrl) {
        if (affiliateUrl == null || affiliateUrl.isBlank()) {
            return new UrlResolutionResponse(
                    affiliateUrl,
                    null,
                    MarketplaceType.OTHER.name(),
                    false,
                    "Affiliate URL is required"
            );
        }

        String originalUrl = affiliateUrl.trim();

        if (!ipSecurityValidator.isSafeUrl(originalUrl)) {
            log.warn("Blocked unsafe URL in AffiliateUrlResolver: {}", originalUrl);
            return new UrlResolutionResponse(
                    originalUrl,
                    null,
                    MarketplaceType.OTHER.name(),
                    false,
                    "URL validation failed: Destination IP/Host is not permitted."
            );
        }

        try {
            URI originalUri = createUri(originalUrl);
            String resolvedUrl = resolveUrlRecursively(originalUri.toString(), 0);

            if (resolvedUrl == null || resolvedUrl.isBlank()) {
                resolvedUrl = originalUrl;
            }

            MarketplaceType marketplaceType = marketplaceService.detectMarketplaceType(resolvedUrl);
            if (marketplaceType == MarketplaceType.OTHER) {
                marketplaceType = marketplaceService.detectMarketplaceType(originalUrl);
            }

            return new UrlResolutionResponse(
                    originalUrl,
                    resolvedUrl,
                    marketplaceType.name(),
                    true,
                    "URL resolved successfully"
            );

        } catch (Exception e) {
            log.warn("URL resolution exception for {}: {}", originalUrl, e.getMessage());
            MarketplaceType fallbackType = marketplaceService.detectMarketplaceType(originalUrl);
            return new UrlResolutionResponse(
                    originalUrl,
                    originalUrl,
                    fallbackType.name(),
                    true,
                    "Fallback to original URL: " + e.getMessage()
            );
        }
    }

    private String resolveUrlRecursively(String url, int depth) {
        if (depth > 5 || url == null || url.isBlank()) {
            return url;
        }

        // SSRF check on each recursive step
        if (!ipSecurityValidator.isSafeUrl(url)) {
            log.warn("SSRF Defense: Blocked intermediate redirect to unsafe URL: {}", url);
            return url;
        }

        try {
            // Check if URL has an embedded target url in query string (e.g. ?url=https%3A%2F%2Fwww.amazon.in...)
            String embedded = extractEmbeddedTargetUrl(url);
            if (embedded != null && !embedded.equalsIgnoreCase(url)) {
                if (ipSecurityValidator.isSafeUrl(embedded)) {
                    return resolveUrlRecursively(embedded, depth + 1);
                }
            }

            URI uri = createUri(url);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(20))
                    .header("User-Agent", getUserAgent())
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String finalUrl = response.uri().toString();

            // Validate final URL after redirects
            if (!ipSecurityValidator.isSafeUrl(finalUrl)) {
                log.warn("SSRF Defense: Final response redirected to unsafe URL: {}", finalUrl);
                return url;
            }

            // Check if final URL has query parameter with direct store link
            String finalEmbedded = extractEmbeddedTargetUrl(finalUrl);
            if (finalEmbedded != null && !finalEmbedded.equalsIgnoreCase(finalUrl)) {
                if (ipSecurityValidator.isSafeUrl(finalEmbedded)) {
                    return resolveUrlRecursively(finalEmbedded, depth + 1);
                }
            }

            // Check if HTML contains meta refresh or JavaScript redirect
            String body = response.body();
            if (body != null && body.length() < 50000) {
                Matcher metaMatcher = META_REFRESH_PATTERN.matcher(body);
                if (metaMatcher.find()) {
                    String metaUrl = metaMatcher.group(1).trim().replace("'", "").replace("\"", "");
                    if (metaUrl.startsWith("http") && ipSecurityValidator.isSafeUrl(metaUrl)) {
                        return resolveUrlRecursively(metaUrl, depth + 1);
                    }
                }

                Matcher jsMatcher = JS_REDIRECT_PATTERN.matcher(body);
                if (jsMatcher.find()) {
                    String jsUrl = jsMatcher.group(1).trim();
                    if (jsUrl.startsWith("http") && ipSecurityValidator.isSafeUrl(jsUrl)) {
                        return resolveUrlRecursively(jsUrl, depth + 1);
                    }
                }
            }

            return finalUrl;

        } catch (Exception e) {
            log.debug("Step error resolving URL {} at depth {}: {}", url, depth, e.getMessage());
            return url;
        }
    }

    private String extractEmbeddedTargetUrl(String url) {
        try {
            if (url.contains("?url=") || url.contains("&url=") || url.contains("?redirect=") || url.contains("&redirect=") || url.contains("?target=") || url.contains("&target=") || url.contains("?dest=") || url.contains("&dest=")) {
                Matcher m = Pattern.compile("[?&](?:url|redirect|target|dest)=(https?[%:][^&]+)").matcher(url);
                if (m.find()) {
                    String encoded = m.group(1);
                    String decoded = URLDecoder.decode(encoded, StandardCharsets.UTF_8);
                    if (decoded.startsWith("http")) {
                        return decoded;
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private URI createUri(String url) {
        String normalizedUrl = url.trim();
        if (!normalizedUrl.matches("(?i)^https?://.*")) {
            normalizedUrl = "https://" + normalizedUrl;
        }
        return URI.create(normalizedUrl);
    }

    private String getUserAgent() {
        return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    }
}