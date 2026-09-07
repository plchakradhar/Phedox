package com.onlineoffers.service;

import com.onlineoffers.dto.ScrapedProductData;
import com.onlineoffers.enums.MarketplaceType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class TelegramProductParser {

    private static final Logger log = LoggerFactory.getLogger(TelegramProductParser.class);

    private static final Pattern URL_PATTERN = Pattern.compile(
            "(https?://[^\\s<>\"'\\[\\]()]+)",
            Pattern.CASE_INSENSITIVE
    );

    // Matches explicit MRP labels like "MRP: 4999", "MRP - Rs 4,290", "Was: 3999", "MRP ₹4290", "Worth: 2999"
    private static final Pattern EXPLICIT_MRP_PATTERN = Pattern.compile(
            "(?:m\\.?r\\.?p\\.?|original\\s*price|was|actual\\s*price|worth|before|strike|cut|old\\s*price)[\\s:=-]*₹?\\s*(?:rs\\.?|inr)?\\s*\\b([0-9]{1,3}(?:,[0-9]{3})+(?:\\.[0-9]{1,2})?|[0-9]+(?:\\.[0-9]{1,2})?)\\b(?!\\s*%)",
            Pattern.CASE_INSENSITIVE
    );

    // Matches explicit Deal price labels like "Deal Price: 1499", "Now: 999", "Offer: 799", "Pay: 499", "@ 999", "At 1499", "Flat 479", "Loot 479"
    private static final Pattern EXPLICIT_DEAL_PRICE_PATTERN = Pattern.compile(
            "(?:deal\\s*price|offer\\s*price|special\\s*price|loot\\s*price|final\\s*price|now\\s*at|pay\\s*only|pay|buy\\s*at|flat|loot|just|now)\\s*₹?\\s*(?:rs\\.?|inr)?\\s*\\b([0-9]{1,3}(?:,[0-9]{3})+(?:\\.[0-9]{1,2})?|[0-9]+(?:\\.[0-9]{1,2})?)\\b(?!\\s*%)",
            Pattern.CASE_INSENSITIVE
    );

    // General price matcher (finds any ₹1,499 or Rs. 1499 or 1499/- or 1499 Rs or @ 11999)
    private static final Pattern ALL_PRICES_PATTERN = Pattern.compile(
            "(?:(?:₹|rs\\.?|inr|@)\\s*\\b([0-9]{1,3}(?:,[0-9]{3})+(?:\\.[0-9]{1,2})?|[0-9]{2,8}(?:\\.[0-9]{1,2})?)\\b|\\b([0-9]{1,3}(?:,[0-9]{3})+(?:\\.[0-9]{1,2})?|[0-9]{2,8}(?:\\.[0-9]{1,2})?)\\s*(?:/-|rs\\.?|inr|only)\\b)(?!\\s*%)",
            Pattern.CASE_INSENSITIVE
    );

    // Standalone line containing primarily a price number (e.g. "479", "  1499  ", "🔥 479", "479/-")
    private static final Pattern STANDALONE_PRICE_LINE_PATTERN = Pattern.compile(
            "(?m)^[\\s*•🔥⚡💥👉👉🏻✅⭐\\-–—#|]*₹?\\s*(?:rs\\.?|inr)?\\s*([0-9]{2,7}(?:\\.[0-9]{1,2})?)\\s*(?:/-)?\\s*$",
            Pattern.CASE_INSENSITIVE
    );

    // Matches percentage discounts like "65% off", "70% discount", "flat 50%", "80% drop"
    private static final Pattern DISCOUNT_PERCENT_PATTERN = Pattern.compile(
            "\\b([1-9][0-9]?)\\s*%(?:\\s*(?:off|discount|drop|save|cut|less))?",
            Pattern.CASE_INSENSITIVE
    );

    public ScrapedProductData parse(String messageText) {
        if (messageText == null || messageText.isBlank()) {
            return null;
        }

        ScrapedProductData data = new ScrapedProductData();
        String text = messageText.trim();

        // 1. Extract product title
        String name = extractTitle(text);
        data.setName(name);
        data.setDescription(text);

        // 2. Extract Prices & Discounts from Telegram text
        BigDecimal explicitMrp = extractFirstBigDecimal(text, EXPLICIT_MRP_PATTERN);
        BigDecimal explicitDealPrice = extractFirstBigDecimal(text, EXPLICIT_DEAL_PRICE_PATTERN);
        BigDecimal discountPercent = extractFirstBigDecimal(text, DISCOUNT_PERCENT_PATTERN);

        // Find all currency figures in the post
        List<BigDecimal> allFoundPrices = extractAllPrices(text);

        BigDecimal finalCurrentPrice = null;
        BigDecimal finalOriginalPrice = null;

        if (explicitDealPrice != null && explicitDealPrice.compareTo(BigDecimal.ZERO) > 0) {
            finalCurrentPrice = explicitDealPrice;
        }

        if (explicitMrp != null && explicitMrp.compareTo(BigDecimal.ZERO) > 0) {
            finalOriginalPrice = explicitMrp;
        }

        // If we found 2+ prices: highest is MRP, lowest is deal price
        if (allFoundPrices.size() >= 2) {
            Collections.sort(allFoundPrices);
            BigDecimal lowest = allFoundPrices.get(0);
            BigDecimal highest = allFoundPrices.get(allFoundPrices.size() - 1);

            if (finalCurrentPrice == null) {
                finalCurrentPrice = lowest;
            }
            if (finalOriginalPrice == null || finalOriginalPrice.compareTo(finalCurrentPrice) <= 0) {
                finalOriginalPrice = highest;
            }
        } else if (allFoundPrices.size() == 1) {
            if (finalCurrentPrice == null) {
                finalCurrentPrice = allFoundPrices.get(0);
            }
        }

        // If we have deal price and a discount percentage (e.g. ₹11999 at 60% off), derive MRP
        if (finalCurrentPrice != null && finalCurrentPrice.compareTo(BigDecimal.ZERO) > 0) {
            if ((finalOriginalPrice == null || finalOriginalPrice.compareTo(finalCurrentPrice) <= 0) && discountPercent != null && discountPercent.compareTo(BigDecimal.ZERO) > 0 && discountPercent.compareTo(BigDecimal.valueOf(100)) < 0) {
                BigDecimal multiplier = BigDecimal.ONE.subtract(discountPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                if (multiplier.compareTo(BigDecimal.ZERO) > 0) {
                    finalOriginalPrice = finalCurrentPrice.divide(multiplier, 2, RoundingMode.HALF_UP);
                    log.info("Calculated MRP ₹{} from deal price ₹{} and {}% discount tag", finalOriginalPrice, finalCurrentPrice, discountPercent);
                }
            }
        }

        data.setCurrentPrice(finalCurrentPrice != null ? finalCurrentPrice : BigDecimal.ZERO);
        data.setOriginalPrice(finalOriginalPrice != null ? finalOriginalPrice : BigDecimal.ZERO);
        data.setInStock(true);

        String link = extractFirstLink(text);
        data.setProductUrl(link);
        data.setCategory(detectCategory(text));

        log.info("Telegram parse result: name='{}', currentPrice={}, originalPrice={}, detectedCategory='{}'",
                data.getName(), data.getCurrentPrice(), data.getOriginalPrice(), data.getCategory());

        return data;
    }

    private String extractTitle(String text) {
        String[] lines = text.split("\\r?\\n");
        String candidate = "Special Deal Product";
        for (String rawLine : lines) {
            String line = rawLine.trim();
            // Skip lines that are only URLs, hashtags, standalone numbers, or buy prompts
            if (line.isEmpty() || line.startsWith("http") || line.matches("^[0-9\\s₹,./\\-–—#|]+$") || line.matches("(?i)^(link|buy|loot|order|shop|deal|check).*https?://.*")) {
                continue;
            }
            // Clean emojis, leading bullets, sale tags
            String cleaned = line.replaceAll("^[\\s*•🔥⚡💥👉👉🏻✅⭐\\-–—#|]+", "")
                    .replaceAll("(?i)\\b(loot deal|mega deal|hot deal|drop|flat|hurry|lowest price ever|special offer)[:!\\s]*", "")
                    .trim();

            if (cleaned.length() >= 3 && !cleaned.matches("^[0-9\\s₹,./\\-–—#|]+$")) {
                candidate = cleaned;
                break;
            }
        }
        return candidate.length() > 200 ? candidate.substring(0, 200) : candidate;
    }

    private static final Pattern DOMAIN_URL_PATTERN = Pattern.compile(
            "\\b((?:www\\.)?(?:amzn\\.(?:to|in)|fkrt\\.(?:it|co)|extrape\\.com|bit\\.ly|cutt\\.ly|tinyurl\\.com|amazon\\.(?:in|com)|flipkart\\.com|myntra\\.com|meesho\\.com|ajio\\.com|shopsy\\.in|tatacliq\\.com|croma\\.com|nykaa\\.com|jiomart\\.com|snapdeal\\.com)/[^\\s<>\"'\\[\\]()]+)",
            Pattern.CASE_INSENSITIVE
    );

    public List<String> extractLinks(String text) {
        List<String> links = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return links;
        }

        Matcher matcher = URL_PATTERN.matcher(text);
        while (matcher.find()) {
            String url = matcher.group(1).trim().replaceAll("[),.!?;:\\]\\[]+$", "");
            if (!url.isBlank() && !links.contains(url)) {
                links.add(url);
            }
        }

        Matcher domainMatcher = DOMAIN_URL_PATTERN.matcher(text);
        while (domainMatcher.find()) {
            String rawUrl = domainMatcher.group(1).trim().replaceAll("[),.!?;:\\]\\[]+$", "");
            String url = rawUrl.startsWith("http") ? rawUrl : "https://" + rawUrl;
            if (!url.isBlank() && !links.contains(url)) {
                links.add(url);
            }
        }

        return links;
    }

    public String extractFirstLink(String text) {
        List<String> links = extractLinks(text);
        return links.isEmpty() ? null : links.get(0);
    }

    public String detectMarketplace(String url) {
        if (url == null || url.isBlank()) {
            return MarketplaceType.OTHER.name();
        }
        String lower = url.toLowerCase(Locale.ROOT);
        if (lower.contains("amazon.") || lower.contains("amzn.to") || lower.contains("amzn.in")) {
            return MarketplaceType.AMAZON.name();
        }
        if (lower.contains("flipkart.") || lower.contains("fkrt.it") || lower.contains("fkrt.co") || lower.contains("dl.flipkart.com")) {
            return MarketplaceType.FLIPKART.name();
        }
        if (lower.contains("myntra.")) {
            return MarketplaceType.MYNTRA.name();
        }
        if (lower.contains("meesho.")) {
            return MarketplaceType.MEESHO.name();
        }
        if (lower.contains("ajio.")) {
            return MarketplaceType.AJIO.name();
        }
        if (lower.contains("croma.")) {
            return MarketplaceType.CROMA.name();
        }
        if (lower.contains("tatacliq.") || lower.contains("tata-cliq")) {
            return MarketplaceType.TATACLIQ.name();
        }
        if (lower.contains("nykaa.")) {
            return MarketplaceType.NYKAA.name();
        }
        if (lower.contains("jiomart.")) {
            return MarketplaceType.JIOMART.name();
        }
        if (lower.contains("snapdeal.")) {
            return MarketplaceType.SNAPDEAL.name();
        }
        if (lower.contains("shopsy.")) {
            return MarketplaceType.SHOPSY.name();
        }
        return MarketplaceType.OTHER.name();
    }

    private String detectCategory(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        if (lower.contains("mobile") || lower.contains("phone") || lower.contains("smartphone") || lower.contains("laptop") || lower.contains("earbud") || lower.contains("headphone") || lower.contains("watch") || lower.contains("electronics") || lower.contains("fan") || lower.contains("motor") || lower.contains("tv") || lower.contains("led") || lower.contains("bldc") || lower.contains("mouse") || lower.contains("keyboard") || lower.contains("gaming")) {
            return "Electronics";
        }
        if (lower.contains("shirt") || lower.contains("tshirt") || lower.contains("jeans") || lower.contains("dress") || lower.contains("shoes") || lower.contains("fashion") || lower.contains("saree") || lower.contains("kurta") || lower.contains("footwear") || lower.contains("sneaker")) {
            return "Fashion";
        }
        if (lower.contains("kitchen") || lower.contains("cooker") || lower.contains("bottle") || lower.contains("home") || lower.contains("furniture") || lower.contains("bedsheet") || lower.contains("curtain") || lower.contains("mixer")) {
            return "Home & Kitchen";
        }
        if (lower.contains("cream") || lower.contains("shampoo") || lower.contains("serum") || lower.contains("perfume") || lower.contains("beauty") || lower.contains("lotion") || lower.contains("face wash")) {
            return "Beauty & Personal Care";
        }
        if (lower.contains("grocery") || lower.contains("oil") || lower.contains("tea") || lower.contains("coffee") || lower.contains("food") || lower.contains("biscuit") || lower.contains("dry fruits") || lower.contains("almonds")) {
            return "Grocery";
        }
        return "General";
    }

    private BigDecimal extractFirstBigDecimal(String text, Pattern pattern) {
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String raw = matcher.group(1).replace(",", "").trim();
            try {
                return new BigDecimal(raw);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private List<BigDecimal> extractAllPrices(String text) {
        List<BigDecimal> prices = new ArrayList<>();
        
        // 1. Explicit formatted prices (e.g. ₹479, Rs 479, 479/-, @ 479)
        Matcher matcher = ALL_PRICES_PATTERN.matcher(text);
        while (matcher.find()) {
            String raw = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
            if (raw != null) {
                addPrice(prices, raw);
            }
        }

        // 2. Standalone lines containing only a price number (e.g. "479", "🔥 479")
        Matcher standaloneMatcher = STANDALONE_PRICE_LINE_PATTERN.matcher(text);
        while (standaloneMatcher.find()) {
            String raw = standaloneMatcher.group(1);
            if (raw != null) {
                addPrice(prices, raw);
            }
        }

        // 3. Fallback: If no prices found yet, extract numbers from lines that are not URLs
        if (prices.isEmpty()) {
            String[] lines = text.split("\\r?\\n");
            for (String line : lines) {
                String trimmed = line.trim();
                if (trimmed.startsWith("http") || trimmed.contains("://")) continue;
                Matcher numMatcher = Pattern.compile("\\b([0-9]{2,6})\\b(?!\\s*%)").matcher(trimmed);
                while (numMatcher.find()) {
                    addPrice(prices, numMatcher.group(1));
                }
            }
        }

        return prices;
    }

    private void addPrice(List<BigDecimal> prices, String raw) {
        try {
            String clean = raw.replace(",", "").trim();
            BigDecimal val = new BigDecimal(clean);
            if (val.compareTo(BigDecimal.ZERO) > 0 && !prices.contains(val)) {
                prices.add(val);
            }
        } catch (Exception ignored) {
        }
    }
}
