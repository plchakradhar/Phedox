import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/category_configs.dart';
import 'category_stroke_icon_widget.dart';

class SubCategoryGridWidget extends StatelessWidget {
  final List<SubCategoryItem> subcategories;
  final String? selectedSubcategory;
  final Function(SubCategoryItem subcat)? onSubCategoryTap;

  const SubCategoryGridWidget({
    super.key,
    required this.subcategories,
    this.selectedSubcategory,
    this.onSubCategoryTap,
  });

  @override
  Widget build(BuildContext context) {
    if (subcategories.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            'Explore Popular Categories',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: AppColors.textMain,
            ),
          ),
        ),
        SizedBox(
          height: 96,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: subcategories.length,
            itemBuilder: (context, index) {
              final subcat = subcategories[index];
              final isSelected = selectedSubcategory != null &&
                  selectedSubcategory!.toLowerCase() == subcat.name.toLowerCase();

              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: InkWell(
                  onTap: () => onSubCategoryTap?.call(subcat),
                  borderRadius: BorderRadius.circular(8),
                  child: SizedBox(
                    width: 72,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isSelected
                                ? AppColors.primaryLight
                                : const Color(0xFFF3F4F6),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.border,
                              width: isSelected ? 2.5 : 1,
                            ),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: CachedNetworkImage(
                            imageUrl: subcat.imageUrl,
                            fit: BoxFit.cover,
                            errorWidget: (context, url, error) => Center(
                              child: CategoryStrokeIconWidget(
                                name: subcat.icon,
                                size: 24,
                                color: isSelected
                                    ? AppColors.primary
                                    : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          subcat.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight:
                                isSelected ? FontWeight.w800 : FontWeight.w600,
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
