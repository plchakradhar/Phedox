class ProductReview {
  final String? reviewerName;
  final dynamic rating;
  final String? reviewTitle;
  final String? comment;
  final String? reviewDate;
  final bool verifiedPurchase;

  ProductReview({
    this.reviewerName,
    this.rating,
    this.reviewTitle,
    this.comment,
    this.reviewDate,
    this.verifiedPurchase = true,
  });

  factory ProductReview.fromJson(Map<String, dynamic> json) {
    return ProductReview(
      reviewerName: json['reviewerName']?.toString(),
      rating: json['rating'],
      reviewTitle: json['reviewTitle']?.toString(),
      comment: json['comment']?.toString(),
      reviewDate: json['reviewDate']?.toString(),
      verifiedPurchase: json['verifiedPurchase'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'reviewerName': reviewerName,
      'rating': rating,
      'reviewTitle': reviewTitle,
      'comment': comment,
      'reviewDate': reviewDate,
      'verifiedPurchase': verifiedPurchase,
    };
  }
}

class ProductModel {
  final dynamic id;
  final String name;
  final String? description;
  final dynamic categoryId;
  final String? categoryName;
  final dynamic marketplaceId;
  final String? marketplaceName;
  final dynamic originalPrice;
  final dynamic currentPrice;
  final dynamic highestPrice;
  final dynamic averagePrice;
  final dynamic lowestPrice;
  final dynamic discountPercentage;
  final dynamic rating;
  final String? ratingCount;
  final String? stockStatus;
  final String? status;
  final String? productUrl;
  final String? affiliateUrl;
  final String? primaryImageUrl;
  final List<String> imageUrls;
  final List<ProductReview> reviews;
  final bool? dealWorth;
  final String? createdAt;
  final String? updatedAt;
  final String? lastCheckedAt;

  ProductModel({
    required this.id,
    required this.name,
    this.description,
    this.categoryId,
    this.categoryName,
    this.marketplaceId,
    this.marketplaceName,
    this.originalPrice,
    this.currentPrice,
    this.highestPrice,
    this.averagePrice,
    this.lowestPrice,
    this.discountPercentage,
    this.rating,
    this.ratingCount,
    this.stockStatus,
    this.status,
    this.productUrl,
    this.affiliateUrl,
    this.primaryImageUrl,
    this.imageUrls = const [],
    this.reviews = const [],
    this.dealWorth,
    this.createdAt,
    this.updatedAt,
    this.lastCheckedAt,
  });

  bool get isOutOfStock =>
      (stockStatus != null && stockStatus!.toUpperCase() == 'OUT_OF_STOCK') ||
      (status != null && status!.toUpperCase() == 'INACTIVE');

  int get parsedDiscount {
    if (discountPercentage == null) return 0;
    try {
      return num.parse(discountPercentage.toString()).round();
    } catch (_) {
      return 0;
    }
  }

  double? get parsedRating {
    if (rating == null) return null;
    try {
      return double.parse(rating.toString());
    } catch (_) {
      return null;
    }
  }

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    var rawImgList = json['imageUrls'];
    List<String> parsedImgs = [];
    if (rawImgList is List) {
      parsedImgs = rawImgList.map((e) => e.toString()).toList();
    }

    var rawReviews = json['reviews'];
    List<ProductReview> parsedReviews = [];
    if (rawReviews is List) {
      parsedReviews = rawReviews
          .map((r) => ProductReview.fromJson(r as Map<String, dynamic>))
          .toList();
    }

    return ProductModel(
      id: json['id'],
      name: json['name']?.toString() ?? 'Deal Product',
      description: json['description']?.toString(),
      categoryId: json['categoryId'],
      categoryName: json['categoryName']?.toString(),
      marketplaceId: json['marketplaceId'],
      marketplaceName: json['marketplaceName']?.toString(),
      originalPrice: json['originalPrice'],
      currentPrice: json['currentPrice'],
      highestPrice: json['highestPrice'],
      averagePrice: json['averagePrice'],
      lowestPrice: json['lowestPrice'],
      discountPercentage: json['discountPercentage'],
      rating: json['rating'],
      ratingCount: json['ratingCount']?.toString(),
      stockStatus: json['stockStatus']?.toString(),
      status: json['status']?.toString(),
      productUrl: json['productUrl']?.toString(),
      affiliateUrl: json['affiliateUrl']?.toString(),
      primaryImageUrl: json['primaryImageUrl']?.toString(),
      imageUrls: parsedImgs,
      reviews: parsedReviews,
      dealWorth: json['dealWorth'] == true,
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
      lastCheckedAt: json['lastCheckedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'marketplaceId': marketplaceId,
      'marketplaceName': marketplaceName,
      'originalPrice': originalPrice,
      'currentPrice': currentPrice,
      'highestPrice': highestPrice,
      'averagePrice': averagePrice,
      'lowestPrice': lowestPrice,
      'discountPercentage': discountPercentage,
      'rating': rating,
      'ratingCount': ratingCount,
      'stockStatus': stockStatus,
      'status': status,
      'productUrl': productUrl,
      'affiliateUrl': affiliateUrl,
      'primaryImageUrl': primaryImageUrl,
      'imageUrls': imageUrls,
      'reviews': reviews.map((r) => r.toJson()).toList(),
      'dealWorth': dealWorth,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'lastCheckedAt': lastCheckedAt,
    };
  }
}
