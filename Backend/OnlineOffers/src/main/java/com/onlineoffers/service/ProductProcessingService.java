package com.onlineoffers.service;

import com.onlineoffers.dto.ProductReviewDto;
import com.onlineoffers.dto.ScrapedProductData;
import com.onlineoffers.dto.UrlResolutionResponse;
import com.onlineoffers.entity.Category;
import com.onlineoffers.entity.Marketplace;
import com.onlineoffers.entity.Product;
import com.onlineoffers.entity.ProductImage;
import com.onlineoffers.entity.ProductReview;
import com.onlineoffers.entity.TelegramPost;
import com.onlineoffers.enums.ProductStatus;
import com.onlineoffers.enums.StockStatus;
import com.onlineoffers.repository.CategoryRepository;
import com.onlineoffers.repository.ProductImageRepository;
import com.onlineoffers.repository.ProductRepository;
import com.onlineoffers.repository.ProductReviewRepository;
import com.onlineoffers.repository.TelegramPostRepository;
import com.onlineoffers.scraper.ScraperFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ProductProcessingService {

    private static final Logger log = LoggerFactory.getLogger(ProductProcessingService.class);

    @Value("${deals.retention.hours:32}")
    private long retentionHours;

    private final TelegramPostRepository telegramPostRepository;
    private final ProductRepository productRepository;
    private final ProductReviewRepository productReviewRepository;
    private final CategoryRepository categoryRepository;
    private final MarketplaceService marketplaceService;
    private final TelegramProductParser telegramProductParser;
    private final AffiliateUrlResolver affiliateUrlResolver;
    private final ScraperFactory scraperFactory;
    private final ImageStorageService imageStorageService;
    private final ProductImageRepository productImageRepository;

    public ProductProcessingService(
            TelegramPostRepository telegramPostRepository,
            ProductRepository productRepository,
            ProductReviewRepository productReviewRepository,
            CategoryRepository categoryRepository,
            MarketplaceService marketplaceService,
            TelegramProductParser telegramProductParser,
            AffiliateUrlResolver affiliateUrlResolver,
            ScraperFactory scraperFactory,
            ImageStorageService imageStorageService,
            ProductImageRepository productImageRepository
    ) {
        this.telegramPostRepository = telegramPostRepository;
        this.productRepository = productRepository;
        this.productReviewRepository = productReviewRepository;
        this.categoryRepository = categoryRepository;
        this.marketplaceService = marketplaceService;
        this.telegramProductParser = telegramProductParser;
        this.affiliateUrlResolver = affiliateUrlResolver;
        this.scraperFactory = scraperFactory;
        this.imageStorageService = imageStorageService;
        this.productImageRepository = productImageRepository;
    }

    @Transactional
    public Product processTelegramPost(Long telegramPostId) {
        TelegramPost telegramPost = telegramPostRepository.findById(telegramPostId)
                .orElseThrow(() -> new RuntimeException("Telegram post not found: " + telegramPostId));

        try {
            telegramPost.setStatus("PROCESSING");
            telegramPost.setProcessed(false);
            telegramPost.setSuccessful(false);
            telegramPost.setProcessingMessage("Extracting Telegram offer details");
            telegramPostRepository.save(telegramPost);

            String messageText = telegramPost.getMessageText();
            if (messageText == null || messageText.isBlank()) {
                throw new RuntimeException("Telegram message text is empty");
            }

            // 1. Extract EXACT affiliate link from Telegram message
            String rawAffiliateUrl = telegramPost.getAffiliateUrl();
            if (rawAffiliateUrl == null || rawAffiliateUrl.isBlank()) {
                rawAffiliateUrl = telegramProductParser.extractFirstLink(messageText);
            }

            if (rawAffiliateUrl == null || rawAffiliateUrl.isBlank()) {
                throw new RuntimeException("Affiliate URL not found in Telegram post");
            }

            final String exactTelegramAffiliateUrl = rawAffiliateUrl.trim();
            telegramPost.setAffiliateUrl(exactTelegramAffiliateUrl);

            // 2. Resolve destination store URL ONLY for web scraping (Keep exactTelegramAffiliateUrl untouched)
            UrlResolutionResponse resolution = affiliateUrlResolver.resolve(exactTelegramAffiliateUrl);
            String resolvedProductUrl = (resolution != null && resolution.getResolvedProductUrl() != null && !resolution.getResolvedProductUrl().isBlank())
                    ? resolution.getResolvedProductUrl()
                    : exactTelegramAffiliateUrl;

            // 3. Detect Marketplace type for branding / category metadata
            String marketplaceType = telegramProductParser.detectMarketplace(resolvedProductUrl);
            if ("OTHER".equals(marketplaceType)) {
                marketplaceType = telegramProductParser.detectMarketplace(exactTelegramAffiliateUrl);
            }
            telegramPost.setMarketplace(marketplaceType);
            telegramPostRepository.save(telegramPost);

            Marketplace marketplace = marketplaceService.findMarketplace(resolvedProductUrl);
            if (marketplace == null || "OTHER".equalsIgnoreCase(marketplace.getName())) {
                marketplace = marketplaceService.findMarketplace(exactTelegramAffiliateUrl);
            }

            // 4. Duplicate Check: check by exact affiliateUrl OR resolved productUrl
            Product existingProduct = productRepository.findByAffiliateUrl(exactTelegramAffiliateUrl)
                    .or(() -> productRepository.findByProductUrl(resolvedProductUrl))
                    .orElse(null);

            // 5. Scrape rich product data from destination website
            ScrapedProductData scrapedData = null;
            try {
                scrapedData = scraperFactory.getScraper(resolvedProductUrl).scrape(resolvedProductUrl);
            } catch (Exception e) {
                log.warn("Scraper error for URL {}: {}. Falling back to Telegram message parsing.", resolvedProductUrl, e.getMessage());
            }

            // Parse text data from Telegram message as fallback / supplement
            ScrapedProductData telegramData = telegramProductParser.parse(messageText);

            // Merge scraped data with Telegram text data
            ScrapedProductData finalData = mergeProductData(scrapedData, telegramData, resolvedProductUrl);

            if (!finalData.isInStock()) {
                markFailed(telegramPost, "Product is currently out of stock");
                return null;
            }

            // 6. Prices & Discount Calculation
            BigDecimal currentPrice = finalData.getCurrentPrice();
            BigDecimal originalPrice = finalData.getOriginalPrice();

            if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
                log.warn("Post #{} price extraction failed. Message text: '{}'", telegramPostId, messageText);
                markFailed(telegramPost, "Valid product price could not be determined from scraping or Telegram text");
                return null;
            }

            // If MRP is missing or equal to current price, check telegram data or calculate from discount
            if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0 || originalPrice.compareTo(currentPrice) <= 0) {
                if (telegramData != null && telegramData.getOriginalPrice() != null && telegramData.getOriginalPrice().compareTo(currentPrice) > 0) {
                    originalPrice = telegramData.getOriginalPrice();
                } else if (finalData.getDiscountPercentage() != null && finalData.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal multiplier = BigDecimal.ONE.subtract(finalData.getDiscountPercentage().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                    if (multiplier.compareTo(BigDecimal.ZERO) > 0) {
                        originalPrice = currentPrice.divide(multiplier, 2, RoundingMode.HALF_UP);
                    }
                } else {
                    originalPrice = currentPrice;
                }
            }

            BigDecimal discountPercentage = calculateDiscount(originalPrice, currentPrice);
            if (discountPercentage.compareTo(BigDecimal.ZERO) == 0 && finalData.getDiscountPercentage() != null && finalData.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
                discountPercentage = finalData.getDiscountPercentage();
            }

            log.info("Post #{} processed: Name='{}', CurrentPrice=₹{}, OriginalPrice=₹{}, Discount={}%",
                    telegramPostId, finalData.getName(), currentPrice, originalPrice, discountPercentage);

            // 7. If product already exists: Compare prices and update if cheaper
            if (existingProduct != null) {
                return handleExistingProductPriceComparison(existingProduct, telegramPost, currentPrice, discountPercentage, exactTelegramAffiliateUrl);
            }

            // 8. Calculate price intelligence bounds
            BigDecimal highestPrice = originalPrice.compareTo(currentPrice) > 0 ? originalPrice : currentPrice;
            BigDecimal lowestPrice = currentPrice;
            BigDecimal averagePrice = originalPrice.add(currentPrice).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);

            // 9. Find or create Category
            Category category = findOrCreateCategory(finalData.getCategory(), finalData.getName(), finalData.getDescription());

            // 10. Instantiate and Save Product
            Product product = new Product();
            product.setName(finalData.getName());
            product.setDescription(finalData.getDescription());
            product.setCategory(category);
            product.setMarketplace(marketplace);
            product.setProductUrl(resolvedProductUrl);
            
            // EXACT affiliate URL from Telegram post strictly preserved
            product.setAffiliateUrl(exactTelegramAffiliateUrl);

            product.setOriginalPrice(originalPrice);
            product.setCurrentPrice(currentPrice);
            product.setHighestPrice(highestPrice);
            product.setAveragePrice(averagePrice);
            product.setLowestPrice(lowestPrice);
            product.setDiscountPercentage(discountPercentage);

            product.setRating(finalData.getRating() != null ? finalData.getRating() : BigDecimal.valueOf(4.2));
            product.setRatingCount(finalData.getRatingCount() != null ? finalData.getRatingCount() : "50+");
            product.setStockStatus(StockStatus.IN_STOCK);
            product.setStatus(ProductStatus.ACTIVE);
            product.setDealWorth(true);
            product.setLastCheckedAt(LocalDateTime.now());
            
            // Explicit 32-hour expiration
            long hours = retentionHours > 0 ? retentionHours : 32;
            product.setExpiresAt(LocalDateTime.now().plusHours(hours));

            Product savedProduct = productRepository.save(product);

            // 11. Save Optional Customer Reviews (if extracted)
            if (finalData.getReviews() != null && !finalData.getReviews().isEmpty()) {
                for (ProductReviewDto revDto : finalData.getReviews()) {
                    try {
                        ProductReview rev = new ProductReview(
                                savedProduct,
                                revDto.getReviewerName(),
                                revDto.getRating(),
                                revDto.getReviewTitle(),
                                revDto.getComment(),
                                revDto.getReviewDate(),
                                revDto.getVerifiedPurchase() != null ? revDto.getVerifiedPurchase() : true
                        );
                        productReviewRepository.save(rev);
                    } catch (Exception revEx) {
                        log.debug("Could not save review for product #{}: {}", savedProduct.getId(), revEx.getMessage());
                    }
                }
            }

            // 12. Download and Store Valid Images — deduplicated by base item ID, max 8 images
            if (finalData.getImageUrls() != null && !finalData.getImageUrls().isEmpty()) {
                List<String> uniqueImageUrls = deduplicateImages(finalData.getImageUrls(), 8);
                boolean isFirst = true;
                int order = 0;
                for (String imgUrl : uniqueImageUrls) {
                    boolean saved = false;
                    try {
                        imageStorageService.downloadAndSaveImage(savedProduct.getId(), imgUrl, isFirst, order);
                        saved = true;
                    } catch (Exception imgEx) {
                        log.warn("Could not download image locally for product #{}: {}", savedProduct.getId(), imgEx.getMessage());
                    }

                    if (!saved) {
                        try {
                            ProductImage fallbackImg = new ProductImage();
                            fallbackImg.setProduct(savedProduct);
                            fallbackImg.setImageUrl(imgUrl);
                            fallbackImg.setOriginalImageUrl(imgUrl);
                            fallbackImg.setIsPrimary(isFirst);
                            fallbackImg.setDisplayOrder(order);
                            productImageRepository.save(fallbackImg);
                        } catch (Exception ex) {
                            log.error("Failed to save remote image fallback: {}", ex.getMessage());
                        }
                    }

                    isFirst = false;
                    order++;
                }
            }

            // 13. Mark Telegram post as PROCESSED / SUCCESSFUL
            telegramPost.setProduct(savedProduct);
            telegramPost.setStatus("PROCESSED");
            telegramPost.setProcessed(true);
            telegramPost.setSuccessful(true);
            telegramPost.setProcessingMessage("Product added to website successfully (Discount: " + discountPercentage + "%)");
            telegramPost.setErrorMessage(null);
            telegramPost.setProcessedAt(LocalDateTime.now());
            telegramPostRepository.save(telegramPost);

            return savedProduct;

        } catch (Exception e) {
            log.error("Error processing telegram post {}: {}", telegramPostId, e.getMessage(), e);
            if (!"FAILED".equals(telegramPost.getStatus())) {
                markFailed(telegramPost, e.getMessage());
            }
            throw e;
        }
    }

    /**
     * Deduplicates image URLs by extracting the base Amazon item ID (e.g. 81vLN7t3oYL).
     * For non-Amazon images, deduplicates by the base filename without size suffixes.
     * Caps at maxCount images.
     */
    private List<String> deduplicateImages(List<String> imageUrls, int maxCount) {
        Map<String, String> seenKeys = new LinkedHashMap<>();
        Pattern amazonItemId = Pattern.compile("/images/I/([A-Za-z0-9]{11,12})");

        for (String url : imageUrls) {
            if (url == null || url.isBlank() || url.startsWith("data:")) continue;
            if (!isValidImageUrl(url)) continue;

            String key;
            Matcher m = amazonItemId.matcher(url);
            if (m.find()) {
                key = m.group(1); // Use Amazon item ID as dedup key
            } else {
                // For non-Amazon: use path basename without query string
                String path = url.split("\\?")[0];
                key = path.substring(path.lastIndexOf('/') + 1)
                        .replaceAll("\\._[A-Za-z0-9_,]+_\\.", "."); // strip size suffixes
            }

            if (!seenKeys.containsKey(key)) {
                seenKeys.put(key, url);
            }
            if (seenKeys.size() >= maxCount) break;
        }
        return new ArrayList<>(seenKeys.values());
    }

    private boolean isValidImageUrl(String url) {
        if (url == null || url.isBlank() || url.startsWith("data:")) return false;
        String lower = url.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".svg") || lower.endsWith(".gif")) return false;
        if (lower.contains("/images/g/") || lower.contains("/g/31/") || lower.contains("/g/01/")) return false;
        if (lower.contains("sprite") || lower.contains("nav-") || lower.contains("pixel") || lower.contains("1x1")) return false;
        if (lower.contains("loading") || lower.contains("spinner") || lower.contains("placeholder")) return false;
        if (lower.contains("play-button") || lower.contains("play-icon") || lower.contains("360_")) return false;
        if (lower.contains("icon") || lower.contains("logo") || lower.contains("badge")) return false;
        return true;
    }

    private Product handleExistingProductPriceComparison(
            Product existingProduct,
            TelegramPost telegramPost,
            BigDecimal newPrice,
            BigDecimal newDiscount,
            String newAffiliateUrl
    ) {
        telegramPost.setProduct(existingProduct);
        telegramPost.setProcessed(true);
        telegramPost.setProcessedAt(LocalDateTime.now());

        if (newPrice.compareTo(existingProduct.getCurrentPrice()) < 0) {
            existingProduct.setCurrentPrice(newPrice);
            existingProduct.setLowestPrice(newPrice);
            existingProduct.setDiscountPercentage(newDiscount);
            existingProduct.setAffiliateUrl(newAffiliateUrl);
            existingProduct.setStatus(ProductStatus.ACTIVE);
            existingProduct.setStockStatus(StockStatus.IN_STOCK);
            existingProduct.setLastCheckedAt(LocalDateTime.now());

            productRepository.save(existingProduct);

            telegramPost.setStatus("PROCESSED");
            telegramPost.setSuccessful(true);
            telegramPost.setProcessingMessage("Existing product price dropped! Updated to new lower price: ₹" + newPrice);
        } else {
            telegramPost.setStatus("PROCESSED");
            telegramPost.setSuccessful(true);
            telegramPost.setProcessingMessage("Existing product already active (Price: ₹" + existingProduct.getCurrentPrice() + "). Ignored higher or duplicate deal.");
        }

        telegramPostRepository.save(telegramPost);
        return existingProduct;
    }

    private boolean isPlaceholderTitle(String name) {
        if (name == null || name.isBlank()) return true;
        String lower = name.toLowerCase(Locale.ROOT).trim();
        return lower.equals("special deal product")
                || lower.equals("special deal offer")
                || lower.equals("amazon deal product")
                || lower.equals("amazon deal offer")
                || lower.equals("flipkart deal offer")
                || lower.equals("flipkart deal product")
                || lower.contains("deal product")
                || lower.contains("deal offer");
    }

    private ScrapedProductData mergeProductData(ScrapedProductData scraped, ScrapedProductData telegram, String productUrl) {
        ScrapedProductData merged = new ScrapedProductData();
        merged.setProductUrl(productUrl);
        merged.setInStock(true);

        // Name
        if (scraped != null && !isPlaceholderTitle(scraped.getName())) {
            merged.setName(scraped.getName());
        } else if (telegram != null && !isPlaceholderTitle(telegram.getName())) {
            merged.setName(telegram.getName());
        } else if (scraped != null && scraped.getName() != null && !scraped.getName().isBlank()) {
            merged.setName(scraped.getName());
        } else if (telegram != null && telegram.getName() != null && !telegram.getName().isBlank()) {
            merged.setName(telegram.getName());
        } else {
            merged.setName("Special Deal Offer");
        }

        // Current Price
        if (scraped != null && scraped.getCurrentPrice() != null && scraped.getCurrentPrice().compareTo(BigDecimal.ZERO) > 0) {
            merged.setCurrentPrice(scraped.getCurrentPrice());
        } else if (telegram != null && telegram.getCurrentPrice() != null && telegram.getCurrentPrice().compareTo(BigDecimal.ZERO) > 0) {
            merged.setCurrentPrice(telegram.getCurrentPrice());
        }

        // Original Price (MRP)
        if (scraped != null && scraped.getOriginalPrice() != null && scraped.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0 && (merged.getCurrentPrice() == null || scraped.getOriginalPrice().compareTo(merged.getCurrentPrice()) > 0)) {
            merged.setOriginalPrice(scraped.getOriginalPrice());
        } else if (telegram != null && telegram.getOriginalPrice() != null && telegram.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0) {
            merged.setOriginalPrice(telegram.getOriginalPrice());
        } else if (scraped != null && scraped.getOriginalPrice() != null && scraped.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0) {
            merged.setOriginalPrice(scraped.getOriginalPrice());
        }

        // Discount percentage
        if (scraped != null && scraped.getDiscountPercentage() != null && scraped.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
            merged.setDiscountPercentage(scraped.getDiscountPercentage());
        } else if (telegram != null && telegram.getDiscountPercentage() != null && telegram.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
            merged.setDiscountPercentage(telegram.getDiscountPercentage());
        }

        // Rating & count
        if (scraped != null && scraped.getRating() != null) {
            merged.setRating(scraped.getRating());
            merged.setRatingCount(scraped.getRatingCount());
        } else {
            merged.setRating(BigDecimal.valueOf(4.2));
            merged.setRatingCount("50+");
        }

        // Images: prioritize scraped product images
        if (scraped != null && scraped.getImageUrls() != null && !scraped.getImageUrls().isEmpty()) {
            merged.setImageUrls(scraped.getImageUrls());
        }

        // Description
        if (scraped != null && scraped.getDescription() != null && !scraped.getDescription().isBlank()) {
            merged.setDescription(scraped.getDescription());
        } else if (telegram != null && telegram.getDescription() != null) {
            merged.setDescription(telegram.getDescription());
        }

        // Category
        if (scraped != null && scraped.getCategory() != null && !scraped.getCategory().isBlank()) {
            merged.setCategory(scraped.getCategory());
        } else if (telegram != null && telegram.getCategory() != null) {
            merged.setCategory(telegram.getCategory());
        } else {
            merged.setCategory("General");
        }

        // Reviews (Optional)
        if (scraped != null && scraped.getReviews() != null && !scraped.getReviews().isEmpty()) {
            merged.setReviews(scraped.getReviews());
        }

        if (scraped != null) {
            merged.setInStock(scraped.isInStock());
        }

        return merged;
    }

    private Category findOrCreateCategory(String rawCategory, String productName, String description) {
        String catTrail = (rawCategory != null ? rawCategory : "").toLowerCase();
        String fullText = ((rawCategory != null ? rawCategory + " " : "") + productName + " " + (description != null ? description : "")).toLowerCase();

        String canonicalCategory = "General";

        // 1. Direct Store Breadcrumb Priority Matching
        if (catTrail.contains("computer") || catTrail.contains("laptop") || catTrail.contains("mice") || catTrail.contains("mouse") || catTrail.contains("keyboard") || catTrail.contains("electronic") || catTrail.contains("audio") || catTrail.contains("headphone") || catTrail.contains("camera") || catTrail.contains("gaming") || catTrail.contains("storage") || catTrail.contains("peripheral")) {
            canonicalCategory = "Electronics";
        } else if (catTrail.contains("mobile") || catTrail.contains("smartphone") || catTrail.contains("cell phone")) {
            canonicalCategory = "Mobiles";
        } else if (catTrail.contains("clothing") || catTrail.contains("apparel") || catTrail.contains("shoes") || catTrail.contains("footwear") || catTrail.contains("fashion") || catTrail.contains("western wear") || catTrail.contains("ethnic wear") || catTrail.contains("watches") || catTrail.contains("jewellery") || catTrail.contains("luggage")) {
            canonicalCategory = "Fashion";
        } else if (catTrail.contains("large appliances") || catTrail.contains("small appliances") || catTrail.contains("refrigerator") || catTrail.contains("washing machine") || catTrail.contains("air conditioner") || catTrail.contains("microwave") || catTrail.contains("television") || catTrail.contains("tv")) {
            canonicalCategory = "Appliances";
        } else if (catTrail.contains("beauty") || catTrail.contains("personal care") || catTrail.contains("skin care") || catTrail.contains("hair care") || catTrail.contains("makeup") || catTrail.contains("fragrance")) {
            canonicalCategory = "Beauty";
        } else if (catTrail.contains("furniture") || catTrail.contains("office furniture") || catTrail.contains("bedroom furniture") || catTrail.contains("living room")) {
            canonicalCategory = "Furniture";
        } else if (catTrail.contains("cookware") || catTrail.contains("kitchen & dining") || catTrail.contains("kitchenware") || catTrail.contains("home decor") || catTrail.contains("bedding") || catTrail.contains("home improvement") || catTrail.contains("home & kitchen")) {
            canonicalCategory = "Home";
        } else if (catTrail.contains("toy") || catTrail.contains("baby") || catTrail.contains("kid") || catTrail.contains("nursery") || catTrail.contains("baby care")) {
            canonicalCategory = "Toys, Baby & Kids";
        } else if (catTrail.contains("grocery") || catTrail.contains("gourmet") || catTrail.contains("food") || catTrail.contains("beverage") || catTrail.contains("snack") || catTrail.contains("health & nutrition")) {
            canonicalCategory = "Food & Health";
        } else if (catTrail.contains("automotive") || catTrail.contains("car accessories") || catTrail.contains("motorbike accessories")) {
            canonicalCategory = "Auto Accessories";
        } else if (catTrail.contains("sports") || catTrail.contains("fitness") || catTrail.contains("exercise") || catTrail.contains("outdoor")) {
            canonicalCategory = "Sports & Fitness";
        } else if (catTrail.contains("book") || catTrail.contains("stationery") || catTrail.contains("office supply") || catTrail.contains("office products")) {
            canonicalCategory = "Books & Stationery";
        }
        
        // 2. Fallback: Full text / Title / Description keyword evaluation
        if ("General".equals(canonicalCategory)) {
            if (fullText.contains("shirt") || fullText.contains("tshirt") || fullText.contains("t-shirt") || fullText.contains("kurti") || fullText.contains("kurta") || fullText.contains("saree") || fullText.contains("jeans") || fullText.contains("sneaker") || fullText.contains("dress") || fullText.contains("clothing") || fullText.contains("wear") || fullText.contains("fashion") || fullText.contains("jacket")) {
                canonicalCategory = "Fashion";
            } else if (fullText.contains("iphone") || fullText.contains("smartphone") || fullText.contains("5g phone") || fullText.contains("redmi") || fullText.contains("realme") || fullText.contains("oneplus") || fullText.contains("samsung galaxy") || fullText.contains("vivo ") || fullText.contains("oppo ") || fullText.contains("mobile")) {
                canonicalCategory = "Mobiles";
            } else if (fullText.contains("laptop") || fullText.contains("tablet") || fullText.contains("headphone") || fullText.contains("earbud") || fullText.contains("tws") || fullText.contains("earphone") || fullText.contains("smartwatch") || fullText.contains("power bank") || fullText.contains("printer") || fullText.contains("electronics") || fullText.contains("speaker") || fullText.contains("gadget") || fullText.contains("mouse") || fullText.contains("keyboard") || fullText.contains("gaming") || fullText.contains("monitor") || fullText.contains("usb") || fullText.contains("charger") || fullText.contains("cable") || fullText.contains("hard drive") || fullText.contains("ssd") || fullText.contains("router")) {
                canonicalCategory = "Electronics";
            } else if (fullText.contains("skincare") || fullText.contains("serum") || fullText.contains("face wash") || fullText.contains("cream") || fullText.contains("shampoo") || fullText.contains("lipstick") || fullText.contains("fragrance") || fullText.contains("perfume") || fullText.contains("beauty") || fullText.contains("makeup")) {
                canonicalCategory = "Beauty";
            } else if (fullText.contains("refrigerator") || fullText.contains("fridge") || fullText.contains("washing machine") || fullText.contains("air conditioner") || fullText.contains("microwave") || fullText.contains("water purifier") || fullText.contains("vacuum cleaner") || fullText.contains("appliance") || fullText.contains("television")) {
                canonicalCategory = "Appliances";
            } else if (fullText.contains("sofa") || fullText.contains("mattress") || fullText.contains("wardrobe") || fullText.contains("bookshelf") || fullText.contains("dining table") || fullText.contains("recliner") || fullText.contains("furniture") || fullText.contains("office chair")) {
                canonicalCategory = "Furniture";
            } else if (fullText.contains("bedsheet") || fullText.contains("cushion") || fullText.contains("curtain") || fullText.contains("cookware") || fullText.contains("wall decor") || fullText.contains("home decor") || fullText.contains("kitchen") || fullText.contains("kadai") || fullText.contains("pan") || fullText.contains("bottle")) {
                canonicalCategory = "Home";
            } else if (fullText.contains("toy") || fullText.contains("lego") || fullText.contains("diaper") || fullText.contains("baby") || fullText.contains("puzzle") || fullText.contains("kid")) {
                canonicalCategory = "Toys, Baby & Kids";
            } else if (fullText.contains("snack") || fullText.contains("grocery") || fullText.contains("dry fruit") || fullText.contains("almond") || fullText.contains("beverage") || fullText.contains("tea") || fullText.contains("coffee") || fullText.contains("food") || fullText.contains("supplement") || fullText.contains("vitamin")) {
                canonicalCategory = "Food & Health";
            } else if (fullText.contains("car ") || fullText.contains("dashcam") || fullText.contains("seat cover") || fullText.contains("floor mat") || fullText.contains("car wash") || fullText.contains("auto access") || fullText.contains("wiper")) {
                canonicalCategory = "Auto Accessories";
            } else if (fullText.contains("cricket") || fullText.contains("football") || fullText.contains("badminton") || fullText.contains("gym") || fullText.contains("dumbbell") || fullText.contains("yoga mat") || fullText.contains("protein") || fullText.contains("fitness") || fullText.contains("running shoe")) {
                canonicalCategory = "Sports & Fitness";
            } else if (fullText.contains("novel") || fullText.contains("fiction") || fullText.contains("exam") || fullText.contains("upsc") || fullText.contains("notebook") || fullText.contains("stationery") || fullText.contains("pen") || fullText.contains("book")) {
                canonicalCategory = "Books & Stationery";
            } else if (fullText.contains("motorcycle") || fullText.contains("scooter") || fullText.contains("electric vehicle") || fullText.contains("ev scooter") || fullText.contains("helmet") || fullText.contains("riding gear") || fullText.contains("two wheeler") || fullText.contains("bike")) {
                canonicalCategory = "Two Wheelers";
            } else if (rawCategory != null && !rawCategory.isBlank() && !rawCategory.equalsIgnoreCase("General")) {
                canonicalCategory = rawCategory.trim();
            }
        }

        final String finalCategoryName = canonicalCategory;
        return categoryRepository.findByNameIgnoreCase(finalCategoryName)
                .orElseGet(() -> {
                    Category category = new Category();
                    category.setName(finalCategoryName);
                    category.setDescription("Best offers in " + finalCategoryName);
                    category.setActive(true);
                    return categoryRepository.save(category);
                });
    }

    private BigDecimal calculateDiscount(BigDecimal originalPrice, BigDecimal currentPrice) {
        if (originalPrice == null || currentPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (currentPrice.compareTo(originalPrice) >= 0) {
            return BigDecimal.ZERO;
        }
        return originalPrice.subtract(currentPrice)
                .multiply(BigDecimal.valueOf(100))
                .divide(originalPrice, 2, RoundingMode.HALF_UP);
    }

    private void markFailed(TelegramPost telegramPost, String message) {
        telegramPost.setStatus("FAILED");
        telegramPost.setProcessed(true);
        telegramPost.setSuccessful(false);
        telegramPost.setProcessingMessage("Processing failed");
        telegramPost.setErrorMessage(message != null ? message : "Unknown processing error");
        telegramPost.setProcessedAt(LocalDateTime.now());
        telegramPostRepository.save(telegramPost);
    }
}