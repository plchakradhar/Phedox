import 'package:flutter/foundation.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../models/marketplace_model.dart';
import '../services/product_service.dart';
import '../services/category_service.dart';
import '../services/marketplace_service.dart';

class DealsFilterProvider extends ChangeNotifier {
  final ProductService _productService = ProductService();
  final CategoryService _categoryService = CategoryService();
  final MarketplaceService _marketplaceService = MarketplaceService();

  List<ProductModel> _allFetchedProducts = [];
  List<CategoryModel> _categories = [];
  List<MarketplaceModel> _marketplaces = [];

  bool _isLoading = false;
  String? _errorMessage;

  // Active filter state
  dynamic _selectedCategoryId;
  dynamic _selectedMarketplaceId;
  String _minDiscount = '';
  String _searchTerm = '';
  String _currentSort = 'newest';
  bool _inStockOnly = false;
  String _maxPrice = '';

  // Getters
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<CategoryModel> get categories => _categories;
  List<MarketplaceModel> get marketplaces => _marketplaces;

  dynamic get selectedCategoryId => _selectedCategoryId;
  dynamic get selectedMarketplaceId => _selectedMarketplaceId;
  String get minDiscount => _minDiscount;
  String get searchTerm => _searchTerm;
  String get currentSort => _currentSort;
  bool get inStockOnly => _inStockOnly;
  String get maxPrice => _maxPrice;

  int get activeFilterCount {
    int count = 0;
    if (_selectedCategoryId != null && _selectedCategoryId.toString().isNotEmpty) count++;
    if (_selectedMarketplaceId != null && _selectedMarketplaceId.toString().isNotEmpty) count++;
    if (_minDiscount.isNotEmpty && _minDiscount != '0') count++;
    if (_searchTerm.trim().isNotEmpty) count++;
    if (_inStockOnly) count++;
    if (_maxPrice.isNotEmpty && num.tryParse(_maxPrice) != null) count++;
    return count;
  }

  String get selectedCategoryName {
    if (_selectedCategoryId == null) return '';
    try {
      final found = _categories.firstWhere((c) => c.id.toString() == _selectedCategoryId.toString());
      return found.name;
    } catch (_) {
      return '';
    }
  }

  String get selectedMarketplaceName {
    if (_selectedMarketplaceId == null) return '';
    try {
      final found = _marketplaces.firstWhere((m) => m.id.toString() == _selectedMarketplaceId.toString());
      return found.name;
    } catch (_) {
      return '';
    }
  }

  List<ProductModel> get filteredProducts {
    var result = List<ProductModel>.from(_allFetchedProducts);

    // Filter in-stock
    if (_inStockOnly) {
      result = result.where((p) => !p.isOutOfStock).toList();
    }

    // Filter max price
    if (_maxPrice.isNotEmpty) {
      final max = num.tryParse(_maxPrice);
      if (max != null) {
        result = result.where((p) {
          final price = num.tryParse(p.currentPrice?.toString() ?? '0') ?? 0;
          return price <= max;
        }).toList();
      }
    }

    // Sort
    switch (_currentSort) {
      case 'discount-desc':
        result.sort((a, b) => b.parsedDiscount.compareTo(a.parsedDiscount));
        break;
      case 'price-asc':
        result.sort((a, b) {
          final priceA = num.tryParse(a.currentPrice?.toString() ?? '0') ?? 0;
          final priceB = num.tryParse(b.currentPrice?.toString() ?? '0') ?? 0;
          return priceA.compareTo(priceB);
        });
        break;
      case 'price-desc':
        result.sort((a, b) {
          final priceA = num.tryParse(a.currentPrice?.toString() ?? '0') ?? 0;
          final priceB = num.tryParse(b.currentPrice?.toString() ?? '0') ?? 0;
          return priceB.compareTo(priceA);
        });
        break;
      case 'newest':
      default:
        result.sort((a, b) {
          final timeA = a.createdAt != null ? DateTime.tryParse(a.createdAt!) ?? DateTime(0) : DateTime(0);
          final timeB = b.createdAt != null ? DateTime.tryParse(b.createdAt!) ?? DateTime(0) : DateTime(0);
          final cmp = timeB.compareTo(timeA);
          if (cmp != 0) return cmp;
          final idA = int.tryParse(a.id?.toString() ?? '0') ?? 0;
          final idB = int.tryParse(b.id?.toString() ?? '0') ?? 0;
          return idB.compareTo(idA);
        });
        break;
    }

    return result;
  }

  Future<void> initMetadata() async {
    try {
      final results = await Future.wait([
        _categoryService.getCategories(),
        _marketplaceService.getMarketplaces(),
      ]);
      _categories = results[0] as List<CategoryModel>;
      _marketplaces = results[1] as List<MarketplaceModel>;
      notifyListeners();
    } catch (e) {
      debugPrint('Metadata loading error: $e');
    }
  }

  Future<void> fetchDeals() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final prods = await _productService.getProducts(
        categoryId: _selectedCategoryId,
        marketplaceId: _selectedMarketplaceId,
        minDiscount: _minDiscount.isNotEmpty ? _minDiscount : null,
        search: _searchTerm.isNotEmpty ? _searchTerm : null,
      );
      _allFetchedProducts = prods;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void setCategory(dynamic categoryId) {
    _selectedCategoryId = categoryId;
    fetchDeals();
  }

  void setMarketplace(dynamic marketplaceId) {
    _selectedMarketplaceId = marketplaceId;
    fetchDeals();
  }

  void setMinDiscount(String discount) {
    _minDiscount = discount;
    fetchDeals();
  }

  void setSearchTerm(String term) {
    _searchTerm = term;
    fetchDeals();
  }

  void setSort(String sort) {
    _currentSort = sort;
    notifyListeners();
  }

  void setInStockOnly(bool inStock) {
    _inStockOnly = inStock;
    notifyListeners();
  }

  void setMaxPrice(String price) {
    _maxPrice = price;
    notifyListeners();
  }

  void resetFilters() {
    _selectedCategoryId = null;
    _selectedMarketplaceId = null;
    _minDiscount = '';
    _searchTerm = '';
    _currentSort = 'newest';
    _inStockOnly = false;
    _maxPrice = '';
    fetchDeals();
  }
}
