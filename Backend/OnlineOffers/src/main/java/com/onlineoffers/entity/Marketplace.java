package com.onlineoffers.entity;

import com.onlineoffers.enums.MarketplaceType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplaces")
public class Marketplace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Marketplace name is required")
    @Size(max = 100, message = "Marketplace name cannot exceed 100 characters")
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @NotNull(message = "Marketplace type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 50)
    private MarketplaceType type;

    @Size(max = 500, message = "Website URL cannot exceed 500 characters")
    @Column(length = 500)
    private String websiteUrl;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (active == null) active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Marketplace() {
    }

    public Marketplace(String name, MarketplaceType type, String websiteUrl) {
        this.name = name;
        this.type = type;
        this.websiteUrl = websiteUrl;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public MarketplaceType getType() {
        return type;
    }

    public void setType(MarketplaceType type) {
        this.type = type;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}