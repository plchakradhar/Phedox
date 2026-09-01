package com.onlineoffers.service;

import com.onlineoffers.entity.Product;
import com.onlineoffers.entity.ProductImage;
import com.onlineoffers.exception.SecurityValidationException;
import com.onlineoffers.repository.ProductImageRepository;
import com.onlineoffers.repository.ProductRepository;
import com.onlineoffers.security.IpSecurityValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.*;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".avif");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"
    );
    private static final long MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final IpSecurityValidator ipSecurityValidator;
    private final Path uploadDirectory;
    private final HttpClient httpClient;

    public ImageStorageService(
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            IpSecurityValidator ipSecurityValidator
    ) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.ipSecurityValidator = ipSecurityValidator;

        this.uploadDirectory = Paths
                .get("uploads/products")
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(uploadDirectory);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create image directory",
                    e
            );
        }

        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .connectTimeout(java.time.Duration.ofSeconds(10))
                .build();
    }

    public ProductImage downloadAndSaveImage(
            Long productId,
            String imageUrl,
            boolean primary,
            int displayOrder
    ) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        if (imageUrl == null || imageUrl.isBlank()) {
            throw new IllegalArgumentException("Image URL is required");
        }

        String sanitizedUrl = imageUrl.trim();

        // 1. SSRF Defense: Check URL destination IP safety
        if (!ipSecurityValidator.isSafeUrl(sanitizedUrl)) {
            log.warn("Blocked unsafe image URL download attempt for product {}: {}", productId, sanitizedUrl);
            throw new SecurityValidationException("Image download rejected: Target host/IP is not permitted.");
        }

        try {
            URI uri = URI.create(sanitizedUrl);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
                    .header("Accept", "image/avif,image/webp,image/apng,image/*,*/*;q=0.8")
                    .header("Referer", "https://www.google.com/")
                    .timeout(java.time.Duration.ofSeconds(12))
                    .GET()
                    .build();

            HttpResponse<byte[]> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofByteArray()
                    );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new RuntimeException("Image download failed. HTTP status: " + response.statusCode());
            }

            byte[] imageBytes = response.body();
            if (imageBytes == null || imageBytes.length == 0) {
                throw new RuntimeException("Downloaded image content is empty");
            }

            if (imageBytes.length > MAX_IMAGE_BYTES) {
                throw new SecurityValidationException("Image size exceeds maximum allowed limit of 10MB");
            }

            // 2. MIME & Content-Type Validation
            String rawContentType = response.headers()
                    .firstValue("Content-Type")
                    .orElse("image/jpeg")
                    .toLowerCase(Locale.ROOT)
                    .split(";")[0]
                    .trim();

            String extension = getImageExtension(rawContentType, sanitizedUrl);

            if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
                log.warn("Blocked prohibited file extension '{}' from URL: {}", extension, sanitizedUrl);
                throw new SecurityValidationException("Unsupported image format: " + extension);
            }

            // 3. Prevent Path Traversal by generating unique UUID filename
            String fileName = UUID.randomUUID().toString() + extension;
            Path targetPath = uploadDirectory.resolve(fileName).normalize();

            if (!targetPath.startsWith(uploadDirectory)) {
                throw new SecurityValidationException("Invalid file destination path (path traversal attempt)");
            }

            Files.write(
                    targetPath,
                    imageBytes,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING
            );

            if (primary) {
                productImageRepository
                        .findByProductIdAndIsPrimaryTrue(productId)
                        .ifPresent(existing -> {
                            existing.setIsPrimary(false);
                            productImageRepository.save(existing);
                        });
            }

            ProductImage productImage = new ProductImage();
            productImage.setProduct(product);
            productImage.setImageUrl("/uploads/products/" + fileName);
            productImage.setOriginalImageUrl(sanitizedUrl);
            productImage.setIsPrimary(primary);
            productImage.setDisplayOrder(displayOrder);

            return productImageRepository.save(productImage);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Image download interrupted", e);
        } catch (SecurityValidationException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Could not download image for product {}: {}", productId, e.getMessage());
            throw new RuntimeException("Could not download image: " + e.getMessage(), e);
        }
    }

    public void deleteImagesForProduct(Long productId) {
        try {
            List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
            for (ProductImage img : images) {
                if (img.getImageUrl() != null && img.getImageUrl().startsWith("/uploads/products/")) {
                    String filename = img.getImageUrl().substring("/uploads/products/".length());
                    Path filePath = uploadDirectory.resolve(filename).normalize();
                    if (filePath.startsWith(uploadDirectory)) {
                        try {
                            Files.deleteIfExists(filePath);
                        } catch (Exception ignored) {
                        }
                    }
                }
            }
            productImageRepository.deleteByProductId(productId);
        } catch (Exception e) {
            log.warn("Error deleting images for product {}: {}", productId, e.getMessage());
        }
    }

    private String getImageExtension(String contentType, String imageUrl) {
        if (contentType.contains("png")) {
            return ".png";
        }
        if (contentType.contains("webp")) {
            return ".webp";
        }
        if (contentType.contains("avif")) {
            return ".avif";
        }
        if (contentType.contains("jpeg") || contentType.contains("jpg")) {
            return ".jpg";
        }

        // Fallback to path extension only if strictly matching allowed types
        try {
            String path = URI.create(imageUrl).getPath();
            if (path != null) {
                int dotIndex = path.lastIndexOf('.');
                if (dotIndex >= 0) {
                    String ext = path.substring(dotIndex).toLowerCase(Locale.ROOT);
                    if (ALLOWED_IMAGE_EXTENSIONS.contains(ext)) {
                        return ext;
                    }
                }
            }
        } catch (Exception ignored) {
        }

        return ".jpg";
    }
}
