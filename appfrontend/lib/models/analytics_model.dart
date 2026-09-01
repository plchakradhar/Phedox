class DashboardAnalyticsModel {
  final dynamic totalActiveProducts;
  final dynamic totalClicks;
  final dynamic totalTelegramPosts;
  final dynamic totalProcessedPosts;
  final dynamic totalFailedPosts;
  final Map<String, dynamic>? clicksByMarketplace;
  final Map<String, dynamic>? productsByCategory;

  DashboardAnalyticsModel({
    this.totalActiveProducts,
    this.totalClicks,
    this.totalTelegramPosts,
    this.totalProcessedPosts,
    this.totalFailedPosts,
    this.clicksByMarketplace,
    this.productsByCategory,
  });

  factory DashboardAnalyticsModel.fromJson(Map<String, dynamic> json) {
    return DashboardAnalyticsModel(
      totalActiveProducts: json['totalActiveProducts'],
      totalClicks: json['totalClicks'],
      totalTelegramPosts: json['totalTelegramPosts'],
      totalProcessedPosts: json['totalProcessedPosts'],
      totalFailedPosts: json['totalFailedPosts'],
      clicksByMarketplace: json['clicksByMarketplace'] is Map
          ? Map<String, dynamic>.from(json['clicksByMarketplace'])
          : null,
      productsByCategory: json['productsByCategory'] is Map
          ? Map<String, dynamic>.from(json['productsByCategory'])
          : null,
    );
  }
}
