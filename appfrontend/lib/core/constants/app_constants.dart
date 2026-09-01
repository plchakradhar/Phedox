class SortOption {
  final String value;
  final String label;

  const SortOption({required this.value, required this.label});
}

class DiscountOption {
  final String value;
  final String label;

  const DiscountOption({required this.value, required this.label});
}

class AppConstants {
  static const String appName = 'Phedox';
  static const String appTagline = 'Hunt Less. Save More.';

  static const String fallbackProductImage =
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  static const String fallbackCategoryImage =
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80';

  static const List<SortOption> sortOptions = [
    SortOption(value: 'newest', label: 'Newest Deals First'),
    SortOption(value: 'discount-desc', label: 'Discount: High to Low'),
    SortOption(value: 'price-asc', label: 'Price: Low to High'),
    SortOption(value: 'price-desc', label: 'Price: High to Low'),
  ];

  static const List<DiscountOption> discountFilterOptions = [
    DiscountOption(value: '', label: 'All Discounts'),
    DiscountOption(value: '20', label: '20% or more'),
    DiscountOption(value: '30', label: '30% or more'),
    DiscountOption(value: '50', label: '50% or more'),
    DiscountOption(value: '70', label: '70% or more'),
    DiscountOption(value: '80', label: '80% or more'),
  ];

  static const List<String> telegramStatuses = [
    'ALL',
    'RECEIVED',
    'PROCESSING',
    'PROCESSED',
    'FAILED',
  ];
}
