import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class StockBadge extends StatelessWidget {
  final String? status;

  const StockBadge({super.key, this.status});

  @override
  Widget build(BuildContext context) {
    final s = (status ?? 'IN_STOCK').toUpperCase();
    final isInStock = s == 'IN_STOCK';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isInStock ? AppColors.successLight : AppColors.dangerLight,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: isInStock ? AppColors.successBorder : AppColors.danger.withValues(alpha: 0.3),
        ),
      ),
      child: Text(
        isInStock ? 'In Stock' : 'Out of Stock',
        style: TextStyle(
          color: isInStock ? AppColors.successDark : AppColors.danger,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
