import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/category_configs.dart';
import 'category_stroke_icon_widget.dart';

class CategoryNavBar extends StatelessWidget {
  final String activeCategoryId;
  final Function(String id, String label) onCategorySelected;

  const CategoryNavBar({
    super.key,
    required this.activeCategoryId,
    required this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 72,
      decoration: const BoxDecoration(
        color: AppColors.bgSurface,
        border: Border(
          bottom: BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        itemCount: CategoryConfigs.fixedCategories.length,
        itemBuilder: (context, index) {
          final cat = CategoryConfigs.fixedCategories[index];
          final id = cat['id']!;
          final label = cat['label']!;
          final iconKey = cat['iconKey']!;
          final isActive = activeCategoryId.toLowerCase() == id.toLowerCase();

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: InkWell(
              onTap: () => onCategorySelected(id, label),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isActive ? AppColors.primaryLight : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isActive ? AppColors.primary : Colors.transparent,
                    width: 1,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CategoryStrokeIconWidget(
                      name: iconKey,
                      size: 20,
                      color: isActive ? AppColors.primary : AppColors.textSecondary,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                        color: isActive ? AppColors.primary : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
