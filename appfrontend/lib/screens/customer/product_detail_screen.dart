import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../core/network/api_client.dart';
import '../../core/utils/currency_formatter.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/product_model.dart';
import '../../services/product_service.dart';
import '../../services/click_service.dart';
import '../../widgets/common/category_stroke_icon_widget.dart';
import '../../widgets/common/deal_badge.dart';
import '../../widgets/common/price_block.dart';
import '../../widgets/common/stock_badge.dart';
import '../../widgets/common/product_grid.dart';
import '../../widgets/common/error_state_view.dart';

class ProductDetailScreen extends StatefulWidget {
  final dynamic productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final ProductService _productService = ProductService();
  ProductModel? _product;
  List<ProductModel> _relatedDeals = [];
  bool _loading = true;
  String? _error;
  int _activeImageIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadProduct();
  }

  Future<void> _loadProduct() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final prod = await _productService.getProductById(widget.productId);
      setState(() {
        _product = prod;
        _activeImageIndex = 0;
      });

      // Load related deals
      if (prod.categoryId != null) {
        _productService
            .getProducts(categoryId: prod.categoryId)
            .then((deals) {
          if (mounted) {
            setState(() {
              _relatedDeals = deals
                  .where((p) => p.id.toString() != prod.id.toString())
                  .take(4)
                  .toList();
            });
          }
        }).catchError((_) {});
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<String> _getUniqueImages() {
    if (_product == null) return [AppConstants.fallbackProductImage];
    final rawList = <String>[
      if (_product!.primaryImageUrl != null && _product!.primaryImageUrl!.isNotEmpty)
        _product!.primaryImageUrl!,
      ..._product!.imageUrls,
    ];

    final seen = <String>{};
    final result = <String>[];

    for (final raw in rawList) {
      final clean = ApiClient().resolveImageUrl(raw);
      if (clean.isEmpty) continue;
      final key = clean.split('?').first.toLowerCase();
      if (!seen.contains(key)) {
        seen.add(key);
        result.add(clean);
      }
    }

    return result.isNotEmpty ? result : [AppConstants.fallbackProductImage];
  }

  void _handleShare() {
    if (_product == null) return;
    final url = ClickService.getRedirectUrl(_product!.id);
    Share.share(
      'Check out this deal on ${_product!.name}: ${CurrencyFormatter.format(_product!.currentPrice)} (${_product!.parsedDiscount}% off) -> $url',
      subject: _product!.name,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Deal Details')),
        body: const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    if (_error != null || _product == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Deal Details')),
        body: Center(
          child: ErrorStateView(
            title: 'Product Not Found',
            message: _error ?? 'The requested deal could not be loaded.',
            onRetry: _loadProduct,
          ),
        ),
      );
    }

    final p = _product!;
    final images = _getUniqueImages();
    final currentImage = images[_activeImageIndex.clamp(0, images.length - 1)];
    final num curr = num.tryParse(p.currentPrice?.toString() ?? '0') ?? 0;
    final num orig = num.tryParse(p.originalPrice?.toString() ?? '0') ?? 0;
    final savings = CurrencyFormatter.calculateSavings(orig, curr);
    final isOutOfStock = p.isOutOfStock;
    final storeColor = AppColors.getMarketplaceColor(p.marketplaceName);

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      appBar: AppBar(
        title: Text(
          p.marketplaceName != null ? 'Deal on ${p.marketplaceName}' : 'Deal Details',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
        ),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.share),
            onPressed: _handleShare,
            tooltip: 'Share Deal',
          ),
        ],
      ),
      bottomNavigationBar: _buildStickyBottomBuyBar(p, curr, orig, savings, isOutOfStock),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── 1. Showcase Image Gallery ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  Stack(
                    children: [
                      Container(
                        height: 300,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFAFAFA),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: CachedNetworkImage(
                          imageUrl: currentImage,
                          fit: BoxFit.contain,
                          errorWidget: (context, url, error) => Image.network(
                            AppConstants.fallbackProductImage,
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),

                      // Discount Tag
                      if (p.parsedDiscount > 0)
                        Positioned(
                          top: 10,
                          left: 10,
                          child: DealBadge(discount: p.parsedDiscount, size: DealBadgeSize.md),
                        ),

                      // Marketplace Badge
                      if (p.marketplaceName != null)
                        Positioned(
                          top: 10,
                          right: 10,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: storeColor,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              p.marketplaceName!,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),

                      // Inactive / Expired Overlay
                      if (isOutOfStock)
                        Positioned.fill(
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.65),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            alignment: Alignment.center,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: AppColors.danger,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'DEAL EXPIRED / OUT OF STOCK',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),

                  // Thumbnails Strip
                  if (images.length > 1) ...[
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 54,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: images.length,
                        itemBuilder: (context, idx) {
                          final isActive = _activeImageIndex == idx;
                          return GestureDetector(
                            onTap: () => setState(() => _activeImageIndex = idx),
                            child: Container(
                              width: 54,
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isActive ? AppColors.primary : AppColors.border,
                                  width: isActive ? 2 : 1,
                                ),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: CachedNetworkImage(
                                imageUrl: images[idx],
                                fit: BoxFit.contain,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 8),

            // ── 2. Product Information Card ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category & Marketplace Row
                  Row(
                    children: [
                      if (p.categoryName != null) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CategoryStrokeIconWidget(
                                name: p.categoryName,
                                size: 12,
                                color: AppColors.primary,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                p.categoryName!,
                                style: const TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      if (p.marketplaceName != null)
                        Text(
                          'Sold on ${p.marketplaceName}',
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Title
                  Text(
                    p.name,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textMain,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Ratings, Assured Tag & Stock Badge
                  Wrap(
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: AppColors.successDark,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              p.parsedRating?.toStringAsFixed(1) ?? '4.2',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(width: 2),
                            const Icon(Icons.star, size: 10, color: Colors.white),
                          ],
                        ),
                      ),
                      Text(
                        '${p.ratingCount ?? '1,200+'} Ratings',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: AppColors.goldAccentLight,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppColors.goldAccentBorder),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.verified_user, size: 10, color: AppColors.goldAccentDark),
                            SizedBox(width: 3),
                            Text(
                              'Assured Deal',
                              style: TextStyle(
                                color: AppColors.goldAccentDark,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                      StockBadge(status: p.stockStatus),
                    ],
                  ),
                  const Divider(color: AppColors.border, height: 24),

                  // Pricing Block
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Special Price',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      PriceBlock(
                        currentPrice: p.currentPrice,
                        originalPrice: p.originalPrice,
                        discountPercentage: p.discountPercentage,
                        size: PriceBlockSize.lg,
                      ),
                      if (savings > 0) ...[
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.successLight,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'You save ${CurrencyFormatter.format(savings)} (${p.parsedDiscount}%) on this deal',
                            style: const TextStyle(
                              color: AppColors.successDark,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // ── 3. Available Offers Box (Flipkart Style) ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(CupertinoIcons.tag_fill, size: 16, color: AppColors.primary),
                      SizedBox(width: 6),
                      Text(
                        'Available Offers',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textMain,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildOfferItem(
                    'Bank Offer',
                    '5% Unlimited Cashback on selected Credit/Debit cards on ${p.marketplaceName ?? 'store'}.',
                  ),
                  _buildOfferItem(
                    'Special Price',
                    'Extra discount included in the final price shown above.',
                  ),
                  _buildOfferItem(
                    'Partner Offer',
                    'Fast shipping & verified deal authenticity tracked via Phedox.',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // ── 4. Trust & Delivery Badges ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildTrustItem(CupertinoIcons.cube_box, 'Free Delivery', 'Standard shipping'),
                  _buildTrustItem(CupertinoIcons.arrow_2_circlepath, 'Return Policy', '7-10 Days Replacement'),
                  _buildTrustItem(CupertinoIcons.shield_lefthalf_fill, '100% Genuine', 'Verified brand deal'),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // ── 5. Price Intelligence History ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(CupertinoIcons.chart_bar_square, size: 16, color: Color(0xFF2563EB)),
                      SizedBox(width: 6),
                      Text(
                        'Price Intelligence History',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textMain,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _buildIntelCell('Current Deal', CurrencyFormatter.format(p.currentPrice), isHighlight: true),
                      _buildIntelCell('MRP (Highest)', CurrencyFormatter.format(p.highestPrice ?? p.originalPrice)),
                      _buildIntelCell('Average Price', CurrencyFormatter.format(p.averagePrice ?? p.currentPrice)),
                      _buildIntelCell('All-Time Low', CurrencyFormatter.format(p.lowestPrice ?? p.currentPrice), isGreen: true),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // ── 6. Highlights & Description ──
            if (p.description != null && p.description!.isNotEmpty)
              Container(
                color: Colors.white,
                padding: const EdgeInsets.all(16),
                width: double.infinity,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Product Description',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textMain,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      p.description!,
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: AppColors.textSecondary,
                        height: 1.45,
                      ),
                    ),
                    if (p.lastCheckedAt != null) ...[
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(CupertinoIcons.clock, size: 12, color: AppColors.textMuted),
                          const SizedBox(width: 4),
                          Text(
                            'Price & stock verified: ${DateFormatter.formatDate(p.lastCheckedAt)}',
                            style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            const SizedBox(height: 8),

            // ── 7. Ratings & Reviews ──
            if (p.reviews.isNotEmpty)
              Container(
                color: Colors.white,
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Customer Ratings & Reviews',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textMain,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...p.reviews.map((rev) => _buildReviewItem(rev)),
                  ],
                ),
              ),
            const SizedBox(height: 8),

            // ── 8. Similar Deals You Might Like ──
            if (_relatedDeals.isNotEmpty)
              Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'Similar Deals You Might Like',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textMain,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    ProductGrid(
                      products: _relatedDeals,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildOfferItem(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_outline, size: 14, color: AppColors.successDark),
          const SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.3),
                children: [
                  TextSpan(
                    text: '$title: ',
                    style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.textMain),
                  ),
                  TextSpan(text: desc),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrustItem(IconData icon, String title, String subtitle) {
    return Column(
      children: [
        Icon(icon, size: 22, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(
          title,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMain),
        ),
        Text(
          subtitle,
          style: const TextStyle(fontSize: 9, color: AppColors.textMuted),
        ),
      ],
    );
  }

  Widget _buildIntelCell(String label, String value, {bool isHighlight = false, bool isGreen = false}) {
    Color valColor = AppColors.textMain;
    if (isHighlight) valColor = AppColors.primary;
    if (isGreen) valColor = AppColors.successDark;

    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 3),
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.bgSubtle,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Column(
          children: [
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 9, color: AppColors.textMuted, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: valColor),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewItem(ProductReview rev) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border, width: 0.8)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.successDark,
                  borderRadius: BorderRadius.circular(3),
                ),
                child: Row(
                  children: [
                    Text(
                      rev.rating?.toString() ?? '5.0',
                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(width: 2),
                    const Icon(Icons.star, size: 8, color: Colors.white),
                  ],
                ),
              ),
              if (rev.reviewTitle != null) ...[
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    rev.reviewTitle!,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ],
          ),
          if (rev.comment != null) ...[
            const SizedBox(height: 6),
            Text(
              rev.comment!,
              style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.35),
            ),
          ],
          const SizedBox(height: 6),
          Row(
            children: [
              Text(
                rev.reviewerName ?? 'Verified Buyer',
                style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w600),
              ),
              if (rev.verifiedPurchase) ...[
                const SizedBox(width: 6),
                const Icon(Icons.verified, size: 10, color: AppColors.successDark),
                const SizedBox(width: 2),
                const Text(
                  'Certified Buyer',
                  style: TextStyle(fontSize: 9, color: AppColors.successDark, fontWeight: FontWeight.w700),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStickyBottomBuyBar(
    ProductModel p,
    num curr,
    num orig,
    num savings,
    bool isOutOfStock,
  ) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
        boxShadow: [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 8,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Left price info
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  CurrencyFormatter.format(curr),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textMain,
                  ),
                ),
                if (orig > curr)
                  Row(
                    children: [
                      Text(
                        CurrencyFormatter.format(orig),
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textMuted,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${p.parsedDiscount}% OFF',
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w800,
                          color: AppColors.successDark,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
            const SizedBox(width: 16),

            // Buy Now CTA button
            Expanded(
              child: SizedBox(
                height: 44,
                child: ElevatedButton(
                  onPressed: isOutOfStock
                      ? null
                      : () => ClickService.buyNow(
                            p.id,
                            fallbackUrl: p.affiliateUrl ?? p.productUrl,
                          ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(CupertinoIcons.bolt_fill, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        isOutOfStock
                            ? 'Out of Stock'
                            : 'Buy on ${p.marketplaceName ?? 'Store'}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
