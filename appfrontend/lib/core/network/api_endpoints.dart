class ApiEndpoints {
  // Public Products Endpoints
  static const String products = '/api/products';
  static String productById(dynamic id) => '/api/products/$id';

  // Categories
  static const String categories = '/api/categories';
  static String categoryById(dynamic id) => '/api/categories/$id';

  // Marketplaces
  static const String marketplaces = '/api/marketplaces';
  static String marketplaceById(dynamic id) => '/api/marketplaces/$id';

  // Affiliate Clicks & Redirect
  static String clickRedirect(dynamic productId) => '/api/clicks/redirect/$productId';

  // Admin Auth
  static const String adminLogin = '/api/admin/auth/login';

  // Admin Dashboard & Analytics
  static const String dashboardAnalytics = '/api/analytics/dashboard';
  static const String adminProducts = '/api/admin/products';

  // Telegram Ingestion
  static const String telegramPosts = '/api/telegram/posts';
  static String telegramPostById(dynamic id) => '/api/telegram/posts/$id';
  static String telegramPostsByStatus(String status) => '/api/telegram/posts/status/$status';
  static String adminProcessTelegram(dynamic id) => '/api/admin/telegram/process/$id';
}
