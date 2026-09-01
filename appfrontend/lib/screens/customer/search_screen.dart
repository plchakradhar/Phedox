import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../models/product_model.dart';
import '../../services/product_service.dart';
import '../../providers/recent_searches_provider.dart';
import '../../widgets/common/product_grid.dart';
import '../../widgets/common/error_state_view.dart';

class SearchScreen extends StatefulWidget {
  final String? initialQuery;

  const SearchScreen({super.key, this.initialQuery});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final ProductService _productService = ProductService();
  late TextEditingController _searchController;
  List<ProductModel> _products = [];
  bool _loading = false;
  String? _error;
  String _currentSort = 'newest';
  bool _hasSearched = false;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.initialQuery ?? '');
    if (widget.initialQuery != null && widget.initialQuery!.trim().isNotEmpty) {
      _executeSearch(widget.initialQuery!.trim());
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _executeSearch(String query) async {
    final clean = query.trim();
    if (clean.isEmpty) return;

    FocusScope.of(context).unfocus();
    setState(() {
      _loading = true;
      _error = null;
      _hasSearched = true;
    });

    // Add to recent searches provider
    context.read<RecentSearchesProvider>().addSearch(clean);

    try {
      final results = await _productService.getProducts(search: clean);
      if (mounted) {
        setState(() {
          _products = results;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  List<ProductModel> get _sortedProducts {
    var result = List<ProductModel>.from(_products);
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
          final timeA = a.createdAt != null
              ? DateTime.tryParse(a.createdAt!) ?? DateTime(0)
              : DateTime(0);
          final timeB = b.createdAt != null
              ? DateTime.tryParse(b.createdAt!) ?? DateTime(0)
              : DateTime(0);
          return timeB.compareTo(timeA);
        });
        break;
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final recentSearches =
        context.watch<RecentSearchesProvider>().recentSearches;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(right: 12),
          child: Container(
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.bgSubtle,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border),
            ),
            child: TextField(
              controller: _searchController,
              autofocus: widget.initialQuery == null,
              textInputAction: TextInputAction.search,
              onSubmitted: _executeSearch,
              decoration: InputDecoration(
                hintText: 'Search 50%+ discount deals...',
                hintStyle: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
                prefixIcon: const Icon(CupertinoIcons.search, size: 16),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 16),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                        },
                      )
                    : null,
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // If not searched yet or searching, show recent searches
          if (!_hasSearched && recentSearches.isNotEmpty) ...[
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Recent Searches',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textMain,
                        ),
                      ),
                      TextButton(
                        onPressed: () =>
                            context.read<RecentSearchesProvider>().clearAll(),
                        child: const Text(
                          'Clear History',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: recentSearches.map((q) {
                      return Chip(
                        label: Text(q),
                        backgroundColor: AppColors.bgSubtle,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: const BorderSide(color: AppColors.border),
                        ),
                        deleteIcon: const Icon(Icons.close, size: 14),
                        onDeleted: () => context
                            .read<RecentSearchesProvider>()
                            .removeSearch(q),
                        labelStyle: const TextStyle(
                          fontSize: 11.5,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const Divider(color: AppColors.border, height: 1),
          ],

          // Search Results Header (Count & Sort)
          if (_hasSearched)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Found ${_products.length} deals for "${_searchController.text.trim()}"',
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMain,
                    ),
                  ),
                  DropdownButton<String>(
                    value: _currentSort,
                    underline: const SizedBox.shrink(),
                    icon: const Icon(Icons.arrow_drop_down, size: 18),
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMain,
                    ),
                    items: AppConstants.sortOptions.map((opt) {
                      return DropdownMenuItem<String>(
                        value: opt.value,
                        child: Text(opt.label),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _currentSort = val);
                    },
                  ),
                ],
              ),
            ),

          // Search Results Grid
          Expanded(
            child: _error != null
                ? SingleChildScrollView(
                    child: ErrorStateView(
                      title: 'Search Error',
                      message: _error!,
                      onRetry: () => _executeSearch(_searchController.text),
                    ),
                  )
                : ProductGrid(
                    products: _sortedProducts,
                    loading: _loading,
                    skeletonCount: 6,
                    emptyTitle: 'No Matching Deals Found',
                    emptyDescription:
                        'We could not find any active 50%+ discount deals matching "${_searchController.text.trim()}". Try searching other keywords.',
                  ),
          ),
        ],
      ),
    );
  }
}
