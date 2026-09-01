import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../core/constants/category_configs.dart';
import '../../models/product_model.dart';
import '../../models/category_model.dart';
import '../../services/product_service.dart';
import '../../services/category_service.dart';
import '../../widgets/common/banner_carousel.dart';
import '../../widgets/common/sub_category_grid_widget.dart';
import '../../widgets/common/product_grid.dart';
import '../../widgets/common/error_state_view.dart';
import 'deals_screen.dart';

class CategoryDealsScreen extends StatefulWidget {
  final dynamic categoryId;
  final String categoryName;
  final bool showAppBar;

  const CategoryDealsScreen({
    super.key,
    required this.categoryId,
    required this.categoryName,
    this.showAppBar = true,
  });

  @override
  State<CategoryDealsScreen> createState() => _CategoryDealsScreenState();
}

class _CategoryDealsScreenState extends State<CategoryDealsScreen> {
  final ProductService _productService = ProductService();
  final CategoryService _categoryService = CategoryService();

  List<ProductModel> _products = [];
  bool _loading = true;
  String? _error;
  String? _selectedSubcategory;
  String _currentSort = 'newest';

  @override
  void initState() {
    super.initState();
    _fetchCategoryData();
  }

  @override
  void didUpdateWidget(covariant CategoryDealsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.categoryId != widget.categoryId ||
        oldWidget.categoryName != widget.categoryName) {
      _selectedSubcategory = null;
      _fetchCategoryData();
    }
  }

  Future<void> _fetchCategoryData() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // 1. Try to match backend category to get numeric Long category ID if available
      int? matchedNumericId = int.tryParse(widget.categoryId.toString());
      List<CategoryModel> backendCategories = [];

      try {
        backendCategories = await _categoryService.getCategories();
      } catch (_) {}

      if (matchedNumericId == null && backendCategories.isNotEmpty) {
        final target = widget.categoryName.toLowerCase().trim();
        final catIdStr = widget.categoryId.toString().toLowerCase().trim();
        final matched = backendCategories.firstWhere(
          (c) =>
              c.name.toLowerCase() == target ||
              c.name.toLowerCase().contains(target) ||
              c.name.toLowerCase().contains(catIdStr),
          orElse: () => CategoryModel(id: -1, name: ''),
        );
        if (matched.id != -1 && matched.id != null) {
          matchedNumericId = int.tryParse(matched.id.toString());
        }
      }

      // 2. Fetch products by numeric category ID or keyword search
      List<ProductModel> rawProducts = [];
      if (matchedNumericId != null && matchedNumericId > 0) {
        rawProducts = await _productService.getProducts(
          categoryId: matchedNumericId,
        );
      } else {
        rawProducts = await _productService.getProducts(
          search: widget.categoryName.isNotEmpty
              ? widget.categoryName
              : widget.categoryId.toString(),
        );
      }

      // 3. If few results, fetch all products and filter for this category
      if (rawProducts.length < 3) {
        try {
          final allProds = await _productService.getProducts();
          final target = widget.categoryName.toLowerCase().trim();
          final filtered = allProds.where((p) {
            final catName = (p.categoryName ?? '').toLowerCase();
            final name = p.name.toLowerCase();
            final desc = (p.description ?? '').toLowerCase();
            if (matchedNumericId != null && p.categoryId == matchedNumericId) {
              return true;
            }
            return catName.contains(target) ||
                name.contains(target) ||
                desc.contains(target);
          }).toList();

          if (filtered.length > rawProducts.length) {
            rawProducts = filtered;
          }
        } catch (_) {}
      }

      if (mounted) {
        setState(() {
          _products = rawProducts;
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

  void _onSubCategoryTap(SubCategoryItem subcat) {
    setState(() {
      if (_selectedSubcategory == subcat.name) {
        _selectedSubcategory = null;
      } else {
        _selectedSubcategory = subcat.name;
      }
    });
  }

  List<ProductModel> get _filteredAndSortedProducts {
    var list = List<ProductModel>.from(_products);

    // Apply subcategory filter if active
    if (_selectedSubcategory != null && _selectedSubcategory!.isNotEmpty) {
      final target = _selectedSubcategory!.toLowerCase().trim();
      final subFiltered = list.where((p) {
        final name = p.name.toLowerCase();
        final desc = (p.description ?? '').toLowerCase();
        return name.contains(target) || desc.contains(target);
      }).toList();

      if (subFiltered.isNotEmpty) {
        list = subFiltered;
      }
    }

    // Apply sorting
    switch (_currentSort) {
      case 'discount-desc':
        list.sort((a, b) => b.parsedDiscount.compareTo(a.parsedDiscount));
        break;
      case 'price-asc':
        list.sort((a, b) {
          final priceA = num.tryParse(a.currentPrice?.toString() ?? '0') ?? 0;
          final priceB = num.tryParse(b.currentPrice?.toString() ?? '0') ?? 0;
          return priceA.compareTo(priceB);
        });
        break;
      case 'price-desc':
        list.sort((a, b) {
          final priceA = num.tryParse(a.currentPrice?.toString() ?? '0') ?? 0;
          final priceB = num.tryParse(b.currentPrice?.toString() ?? '0') ?? 0;
          return priceB.compareTo(priceA);
        });
        break;
      case 'newest':
      default:
        list.sort((a, b) {
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

    return list;
  }

  Widget _buildContent() {
    final config = CategoryConfigs.getConfig(widget.categoryName) ??
        CategoryConfigs.getConfig(widget.categoryId.toString());
    final displayProducts = _filteredAndSortedProducts;

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _fetchCategoryData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),

            // ── 1. Category Banners Carousel ──
            if (config != null && config.banners.isNotEmpty) ...[
              BannerCarousel(
                banners: config.banners,
                onBannerTap: (b) {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const DealsScreen(),
                    ),
                  );
                },
              ),
              const SizedBox(height: 10),
            ],

            // ── 2. Subcategories Circular Grid ──
            if (config != null && config.subcats.isNotEmpty) ...[
              SubCategoryGridWidget(
                subcategories: config.subcats,
                selectedSubcategory: _selectedSubcategory,
                onSubCategoryTap: _onSubCategoryTap,
              ),
              const SizedBox(height: 8),
            ],

            // ── Active Subcategory Banner Filter Chip ──
            if (_selectedSubcategory != null) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      Text(
                        'Showing deals for "$_selectedSubcategory" in ${widget.categoryName}',
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                      const Spacer(),
                      InkWell(
                        onTap: () => setState(() => _selectedSubcategory = null),
                        child: const Row(
                          children: [
                            Text(
                              'Clear',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primary,
                              ),
                            ),
                            SizedBox(width: 2),
                            Icon(Icons.close, size: 14, color: AppColors.primary),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 6),
            ],

            // ── 3. Promo Cards Horizontal List ──
            if (config != null && config.promos.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                child: SizedBox(
                  height: 80,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: config.promos.length,
                    itemBuilder: (context, idx) {
                      final promo = config.promos[idx];
                      return Container(
                        width: 220,
                        margin: const EdgeInsets.only(right: 10),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Color(promo.bgColor),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              promo.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 12.5,
                              ),
                            ),
                            Text(
                              promo.subtitle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 10.5,
                                color: AppColors.textMuted,
                              ),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    promo.tag,
                                    style: const TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                                const Icon(Icons.arrow_forward,
                                    size: 12, color: AppColors.primary),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],

            // ── 4. Deals Section Header & Sort ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${widget.categoryName} Deals',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textMain,
                    ),
                  ),
                  Row(
                    children: [
                      Text(
                        '${displayProducts.length} Offers',
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(width: 8),
                      DropdownButton<String>(
                        value: _currentSort,
                        underline: const SizedBox.shrink(),
                        icon: const Icon(Icons.arrow_drop_down, size: 16),
                        style: const TextStyle(
                          fontSize: 11,
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
                ],
              ),
            ),

            if (_error != null)
              ErrorStateView(
                title: 'Notice',
                message: _error!,
                onRetry: _fetchCategoryData,
              )
            else
              ProductGrid(
                products: displayProducts,
                loading: _loading,
                skeletonCount: 6,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                emptyTitle: _selectedSubcategory != null
                    ? 'No Deals in "$_selectedSubcategory"'
                    : 'No Deals in ${widget.categoryName}',
                emptyDescription: _selectedSubcategory != null
                    ? 'Try clearing the subcategory filter to view all ${widget.categoryName} deals.'
                    : 'We are continually adding verified discounts. Check back shortly!',
              ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.showAppBar) {
      return _buildContent();
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.categoryName,
          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
        ),
      ),
      body: _buildContent(),
    );
  }
}
