package com.onlineoffers.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "scraping_logs",
    indexes = {
        @Index(name = "idx_scraping_log_product", columnList = "product_id"),
        @Index(name = "idx_scraping_log_marketplace", columnList = "marketplace"),
        @Index(name = "idx_scraping_log_status", columnList = "status"),
        @Index(name = "idx_scraping_log_created", columnList = "created_at")
    }
)
public class ScrapingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(length = 100)
    private String marketplace;

    @Column(nullable = false, length = 2000)
    private String url;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(length = 1000)
    private String message;

    @Column
    private Integer responseCode;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public ScrapingLog() {
    }

    public ScrapingLog(
            Product product,
            String marketplace,
            String url,
            String status,
            String message,
            Integer responseCode
    ) {
        this.product = product;
        this.marketplace = marketplace;
        this.url = url;
        this.status = status;
        this.message = message;
        this.responseCode = responseCode;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getMarketplace() {
        return marketplace;
    }

    public void setMarketplace(String marketplace) {
        this.marketplace = marketplace;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getResponseCode() {
        return responseCode;
    }

    public void setResponseCode(Integer responseCode) {
        this.responseCode = responseCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}