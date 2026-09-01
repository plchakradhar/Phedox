package com.onlineoffers.dto;

public class ProductReviewDto {

    private String reviewerName;
    private String rating;
    private String reviewTitle;
    private String comment;
    private String reviewDate;
    private Boolean verifiedPurchase;

    public ProductReviewDto() {
    }

    public ProductReviewDto(String reviewerName, String rating, String reviewTitle, String comment, String reviewDate, Boolean verifiedPurchase) {
        this.reviewerName = reviewerName;
        this.rating = rating;
        this.reviewTitle = reviewTitle;
        this.comment = comment;
        this.reviewDate = reviewDate;
        this.verifiedPurchase = verifiedPurchase;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public String getRating() {
        return rating;
    }

    public void setRating(String rating) {
        this.rating = rating;
    }

    public String getReviewTitle() {
        return reviewTitle;
    }

    public void setReviewTitle(String reviewTitle) {
        this.reviewTitle = reviewTitle;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getReviewDate() {
        return reviewDate;
    }

    public void setReviewDate(String reviewDate) {
        this.reviewDate = reviewDate;
    }

    public Boolean getVerifiedPurchase() {
        return verifiedPurchase;
    }

    public void setVerifiedPurchase(Boolean verifiedPurchase) {
        this.verifiedPurchase = verifiedPurchase;
    }
}
