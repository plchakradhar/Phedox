import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

enum DealBadgeSize { sm, md, lg }

class DealBadge extends StatelessWidget {
  final dynamic discount;
  final DealBadgeSize size;

  const DealBadge({
    super.key,
    required this.discount,
    this.size = DealBadgeSize.sm,
  });

  @override
  Widget build(BuildContext context) {
    final int numDiscount = (discount is num)
        ? (discount as num).round()
        : int.tryParse(discount?.toString() ?? '0') ?? 0;

    if (numDiscount <= 0) return const SizedBox.shrink();

    double fontSize = 10;
    EdgeInsets padding = const EdgeInsets.symmetric(horizontal: 6, vertical: 3);

    if (size == DealBadgeSize.md) {
      fontSize = 12;
      padding = const EdgeInsets.symmetric(horizontal: 8, vertical: 4);
    } else if (size == DealBadgeSize.lg) {
      fontSize = 14;
      padding = const EdgeInsets.symmetric(horizontal: 10, vertical: 5);
    }

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(4),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33D90000),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        '$numDiscount% OFF',
        style: TextStyle(
          color: Colors.white,
          fontSize: fontSize,
          fontWeight: FontWeight.w900,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}
