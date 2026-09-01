import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../models/category_model.dart';
import '../../services/category_service.dart';
import '../../widgets/common/category_stroke_icon_widget.dart';
import '../../widgets/common/error_state_view.dart';
import '../../widgets/common/empty_state_view.dart';
import 'category_deals_screen.dart';

class CategoriesScreen extends StatefulWidget {
  final Function(dynamic id, String name)? onSelectCategory;

  const CategoriesScreen({super.key, this.onSelectCategory});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  final CategoryService _categoryService = CategoryService();
  List<CategoryModel> _categories = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchCategories();
  }

  Future<void> _fetchCategories() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final cats = await _categoryService.getCategories();
      if (mounted) {
        setState(() {
          _categories = cats;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Deal Categories',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchCategories,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header description
              const Text(
                'EXPLORE BY CATEGORY',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Browse Deal Categories',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textMain,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Find massive discounts of 50% or more neatly organized across all major shopping categories.',
                style: TextStyle(
                  fontSize: 12.5,
                  color: AppColors.textMuted,
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 16),

              if (_error != null)
                ErrorStateView(
                  title: 'Error Loading Categories',
                  message: _error!,
                  onRetry: _fetchCategories,
                )
              else if (_loading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                )
              else if (_categories.isEmpty)
                const EmptyStateView(
                  icon: CupertinoIcons.square_grid_2x2,
                  title: 'No Categories Available',
                  description:
                      'Categories will appear as soon as configured in the backend.',
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _categories.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    return InkWell(
                      onTap: () {
                        if (widget.onSelectCategory != null) {
                          widget.onSelectCategory!(cat.id, cat.name);
                        } else {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => CategoryDealsScreen(
                                categoryId: cat.id,
                                categoryName: cat.name,
                              ),
                            ),
                          );
                        }
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x06000000),
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: AppColors.primaryLight,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: cat.imageUrl != null &&
                                      cat.imageUrl!.isNotEmpty
                                  ? CachedNetworkImage(
                                      imageUrl: cat.imageUrl!,
                                      fit: BoxFit.cover,
                                      errorWidget: (context, url, error) => Center(
                                        child: CategoryStrokeIconWidget(
                                          name: cat.name,
                                          size: 24,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                    )
                                  : Center(
                                      child: CategoryStrokeIconWidget(
                                        name: cat.name,
                                        size: 24,
                                        color: AppColors.primary,
                                      ),
                                    ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    cat.name,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.textMain,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    cat.description ??
                                        'Browse 50%+ deals in this category',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 11.5,
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(
                              Icons.arrow_forward_ios,
                              size: 14,
                              color: AppColors.primary,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
