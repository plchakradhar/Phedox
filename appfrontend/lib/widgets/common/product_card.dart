import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../core/network/api_client.dart';
import '../../models/product_model.dart';
import '../../services/click_service.dart';
import '../../screens/customer/product_detail_screen.dart';
import 'deal_badge.dart';
import 'price_block.dart';
import 'category_stroke_icon_widget.dart';

class ProductCard extends StatelessWidget {
  final ProductModel product;

  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final isOutOfStock = product.isOutOfStock;
    final int discount = product.parsedDiscount;
    final double? rating = product.parsedRating;

    final rawImg = product.primaryImageUrl ??
        (product.imageUrls.isNotEmpty ? product.imageUrls.first : '');
    final imageUrl = ApiClient().resolveImageUrl(rawImg);
    final finalImageUrl =
        imageUrl.isNotEmpty ? imageUrl : AppConstants.fallbackProductImage;

    final storeColor = AppColors.getMarketplaceColor(product.marketplaceName);

    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(productId: product.id),
          ),
        );
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border, width: 1),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── 1. Image Section ──
            AspectRatio(
              aspectRatio: 1.05,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Container(
                    color: const Color(0xFFF9FAFB),
                    child: CachedNetworkImage(
                      imageUrl: finalImageUrl,
                      fit: BoxFit.contain,
                      placeholder: (context, url) => Shimmer.fromColors(
                        baseColor: const Color(0xFFE5E7EB),
                        highlightColor: const Color(0xFFF3F4F6),
                        child: Container(color: Colors.white),
                      ),
                      errorWidget: (context, url, error) => Image.network(
                        AppConstants.fallbackProductImage,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),

                  // Discount Badge (Top Left)
                  if (discount > 0)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: DealBadge(discount: discount, size: DealBadgeSize.sm),
                    ),

                  // Marketplace Badge (Top Right)
                  if (product.marketplaceName != null &&
                      product.marketplaceName!.isNotEmpty)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: storeColor,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          product.marketplaceName!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),

                  // Out of stock overlay
                  if (isOutOfStock)
                    Container(
                      color: Colors.black.withValues(alpha: 0.65),
                      alignment: Alignment.center,
                      child: const Text(
                        'Out of Stock',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // ── 2. Content Section ──
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Top part: Category & Title
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Category Line
                        if (product.categoryName != null &&
                            product.categoryName!.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Row(
                              children: [
                                CategoryStrokeIconWidget(
                                  name: product.categoryName,
                                  size: 11,
                                  color: AppColors.textMuted,
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    product.categoryName!,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                        // Title
                        Text(
                          product.name,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.textMain,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            height: 1.25,
                          ),
                        ),
                        const SizedBox(height: 6),

                        // Rating & Assured Badge
                        Row(
                          children: [
                            if (rating != null) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 5, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.successDark,
                                  borderRadius: BorderRadius.circular(3),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      rating.toStringAsFixed(1),
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 9,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                    const SizedBox(width: 2),
                                    const Icon(
                                      Icons.star,
                                      size: 8,
                                      color: Colors.white,
                                    ),
                                  ],
                                ),
                              ),
                              if (product.ratingCount != null)
                                Padding(
                                  padding: const EdgeInsets.only(left: 4),
                                  child: Text(
                                    '(${product.ratingCount})',
                                    style: const TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 9,
                                    ),
                                  ),
                                ),
                            ] else
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 5, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  borderRadius: BorderRadius.circular(3),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.verified_outlined,
                                      size: 9,
                                      color: AppColors.primary,
                                    ),
                                    SizedBox(width: 2),
                                    Text(
                                      'Verified',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontSize: 9,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            const Spacer(),
                            if (!isOutOfStock)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 4, vertical: 1.5),
                                decoration: BoxDecoration(
                                  color: AppColors.goldAccentLight,
                                  borderRadius: BorderRadius.circular(3),
                                  border: Border.all(
                                    color: AppColors.goldAccentBorder,
                                    width: 0.8,
                                  ),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.check_circle,
                                      size: 8,
                                      color: AppColors.goldAccentDark,
                                    ),
                                    SizedBox(width: 2),
                                    Text(
                                      'Assured',
                                      style: TextStyle(
                                        color: AppColors.goldAccentDark,
                                        fontSize: 8,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),

                    // Bottom part: Price & Buy Button
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 6),
                        PriceBlock(
                          currentPrice: product.currentPrice,
                          originalPrice: product.originalPrice,
                          discountPercentage: product.discountPercentage,
                          size: PriceBlockSize.sm,
                        ),
                        const SizedBox(height: 4),

                        // Free Delivery Tag
                        if (!isOutOfStock)
                          const Row(
                            children: [
                              Icon(
                                CupertinoIcons.cube_box,
                                size: 10,
                                color: AppColors.successDark,
                              ),
                              SizedBox(width: 3),
                              Text(
                                'Free Delivery',
                                style: TextStyle(
                                  color: AppColors.successDark,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        const SizedBox(height: 6),

                        // Buy Now Button
                        SizedBox(
                          width: double.infinity,
                          height: 32,
                          child: ElevatedButton(
                            onPressed: isOutOfStock
                                ? null
                                : () => ClickService.buyNow(product.id,
                                    fallbackUrl: product.affiliateUrl ??
                                        product.productUrl),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: EdgeInsets.zero,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Buy Now',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                SizedBox(width: 4),
                                Icon(
                                  Icons.arrow_outward,
                                  size: 11,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
