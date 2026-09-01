package com.onlineoffers.dto;

public class MarketplaceResponse {

    private Long id;
    private String name;
    private String type;
    private String websiteUrl;
    private Boolean active;

    public MarketplaceResponse() {
    }

    public MarketplaceResponse(Long id, String name, String type, String websiteUrl, Boolean active) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.websiteUrl = websiteUrl;
        this.active = active;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
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
}
