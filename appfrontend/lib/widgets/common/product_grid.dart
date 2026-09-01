import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../models/product_model.dart';
import 'product_card.dart';
import 'empty_state_view.dart';

class ProductGrid extends StatelessWidget {
  final List<ProductModel> products;
  final bool loading;
  final int skeletonCount;
  final String? emptyTitle;
  final String? emptyDescription;
  final VoidCallback? onResetFilters;
  final bool shrinkWrap;
  final ScrollPhysics? physics;

  const ProductGrid({
    super.key,
    required this.products,
    this.loading = false,
    this.skeletonCount = 6,
    this.emptyTitle,
    this.emptyDescription,
    this.onResetFilters,
    this.shrinkWrap = false,
    this.physics,
  });

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return GridView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.58,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
        ),
        itemCount: skeletonCount,
        shrinkWrap: shrinkWrap,
        physics: physics ?? const NeverScrollableScrollPhysics(),
        itemBuilder: (context, index) {
          return Shimmer.fromColors(
            baseColor: const Color(0xFFE5E7EB),
            highlightColor: const Color(0xFFF3F4F6),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        },
      );
    }

    if (products.isEmpty) {
      return EmptyStateView(
        icon: CupertinoIcons.sparkles,
        title: emptyTitle ?? 'No Deals Currently Available',
        description: emptyDescription ??
            'Check back soon for exclusive mega discount offers and verified deals.',
        actionLabel: onResetFilters != null ? 'Reset Filters' : null,
        onAction: onResetFilters,
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.56,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: products.length,
      shrinkWrap: shrinkWrap,
      physics: physics,
      itemBuilder: (context, index) {
        return ProductCard(product: products[index]);
      },
    );
  }
}
