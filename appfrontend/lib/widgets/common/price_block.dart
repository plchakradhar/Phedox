import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';

enum PriceBlockSize { sm, md, lg }

class PriceBlock extends StatelessWidget {
  final dynamic currentPrice;
  final dynamic originalPrice;
  final dynamic discountPercentage;
  final PriceBlockSize size;

  const PriceBlock({
    super.key,
    required this.currentPrice,
    this.originalPrice,
    this.discountPercentage,
    this.size = PriceBlockSize.md,
  });

  @override
  Widget build(BuildContext context) {
    final num curr = num.tryParse(currentPrice?.toString() ?? '0') ?? 0;
    final num orig = num.tryParse(originalPrice?.toString() ?? '0') ?? 0;
    final int disc = (discountPercentage is num)
        ? (discountPercentage as num).round()
        : int.tryParse(discountPercentage?.toString() ?? '0') ?? 0;

    double currentSize = 15;
    double originalSize = 11;
    double discSize = 11;

    if (size == PriceBlockSize.lg) {
      currentSize = 22;
      originalSize = 14;
      discSize = 14;
    } else if (size == PriceBlockSize.sm) {
      currentSize = 13;
      originalSize = 10;
      discSize = 10;
    }

    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 6,
      children: [
        Text(
          CurrencyFormatter.format(curr),
          style: TextStyle(
            color: AppColors.textMain,
            fontSize: currentSize,
            fontWeight: FontWeight.w900,
          ),
        ),
        if (orig > curr)
          Text(
            CurrencyFormatter.format(orig),
            style: TextStyle(
              color: AppColors.textMuted,
              fontSize: originalSize,
              fontWeight: FontWeight.w400,
              decoration: TextDecoration.lineThrough,
            ),
          ),
        if (disc > 0)
          Text(
            '$disc% off',
            style: TextStyle(
              color: AppColors.successDark,
              fontSize: discSize,
              fontWeight: FontWeight.w700,
            ),
          ),
      ],
    );
  }
}
