import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/category_configs.dart';
import '../../models/product_model.dart';
import '../../services/product_service.dart';
import '../../providers/recent_searches_provider.dart';
import '../../widgets/common/banner_carousel.dart';
import '../../widgets/common/product_grid.dart';
import '../../widgets/common/error_state_view.dart';
import 'deals_screen.dart';
import 'search_screen.dart';

class HomeScreen extends StatefulWidget {
  final Function(String id, String label)? onNavigateCategory;

  const HomeScreen({super.key, this.onNavigateCategory});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ProductService _productService = ProductService();
  List<ProductModel> _products = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchHomeProducts();
  }

  Future<void> _fetchHomeProducts() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final prods = await _productService.getProducts();
      if (mounted) {
        setState(() {
          _products = prods;
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

  List<ProductModel> get _top80Deals {
    return _products.where((p) => p.parsedDiscount >= 80).toList();
  }

  @override
  Widget build(BuildContext context) {
    final recentSearches =
        context.watch<RecentSearchesProvider>().recentSearches;

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _fetchHomeProducts,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),

            // ── 1. Hero Promotional Banners Carousel ──
            BannerCarousel(
              banners: CategoryConfigs.homeBanners,
              onBannerTap: (banner) {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => const DealsScreen(),
                  ),
                );
              },
            ),

            // ── 2. Recent Searches Chips Bar ──
            if (recentSearches.isNotEmpty) ...[
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: SizedBox(
                  height: 32,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: recentSearches.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return const Padding(
                          padding: EdgeInsets.only(right: 8, top: 6),
                          child: Text(
                            'Recent:',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textMuted,
                            ),
                          ),
                        );
                      }
                      final query = recentSearches[index - 1];
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: ActionChip(
                          label: Text(
                            query,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          backgroundColor: AppColors.bgSubtle,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: const BorderSide(color: AppColors.border),
                          ),
                          padding: EdgeInsets.zero,
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) =>
                                    SearchScreen(initialQuery: query),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],

            // Error notice
            if (_error != null)
              ErrorStateView(
                title: 'Connection Notice',
                message: _error!,
                onRetry: _fetchHomeProducts,
              ),

            const SizedBox(height: 14),

            // ── 3. Top Deals — 80%+ OFF ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(
                        CupertinoIcons.flame_fill,
                        color: Color(0xFFDC2626),
                        size: 20,
                      ),
                      SizedBox(width: 6),
                      Text(
                        'Top Deals — 80%+ OFF',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFDC2626),
                        ),
                      ),
                    ],
                  ),
                  InkWell(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) =>
                              const DealsScreen(initialMinDiscount: '80'),
                        ),
                      );
                    },
                    child: const Row(
                      children: [
                        Text(
                          'View All',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                        Icon(
                          Icons.arrow_forward_ios,
                          size: 10,
                          color: AppColors.primary,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            ProductGrid(
              products: _top80Deals,
              loading: _loading,
              skeletonCount: 4,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              emptyTitle: 'No 80%+ Deals Currently Available',
              emptyDescription:
                  'Check back soon for exclusive 80%+ mega discount offers.',
            ),

            const SizedBox(height: 14),

            // ── 4. All Products ──
            if (_products.isNotEmpty || _loading) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(
                          CupertinoIcons.bolt_fill,
                          color: AppColors.primary,
                          size: 18,
                        ),
                        SizedBox(width: 6),
                        Text(
                          'All Products',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textMain,
                          ),
                        ),
                      ],
                    ),
                    InkWell(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const DealsScreen(),
                          ),
                        );
                      },
                      child: const Row(
                        children: [
                          Text(
                            'View All Deals',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                          Icon(
                            Icons.arrow_forward_ios,
                            size: 10,
                            color: AppColors.primary,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              ProductGrid(
                products: _products,
                loading: _loading,
                skeletonCount: 8,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
              ),
            ],

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
