import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/deals_filter_provider.dart';
import '../../widgets/common/product_grid.dart';
import '../../widgets/common/category_stroke_icon_widget.dart';
import '../../widgets/common/error_state_view.dart';

class DealsScreen extends StatefulWidget {
  final dynamic initialCategoryId;
  final String? initialMinDiscount;

  const DealsScreen({
    super.key,
    this.initialCategoryId,
    this.initialMinDiscount,
  });

  @override
  State<DealsScreen> createState() => _DealsScreenState();
}

class _DealsScreenState extends State<DealsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<DealsFilterProvider>();
      provider.initMetadata();
      if (widget.initialCategoryId != null) {
        provider.setCategory(widget.initialCategoryId);
      } else if (widget.initialMinDiscount != null) {
        provider.setMinDiscount(widget.initialMinDiscount!);
      } else {
        provider.fetchDeals();
      }
    });
  }

  void _openFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => const _DealsFilterModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DealsFilterProvider>();
    final products = provider.filteredProducts;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'All Deals',
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
        ),
        actions: [
          // Filter button with badge
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(CupertinoIcons.slider_horizontal_3),
                onPressed: _openFilterBottomSheet,
                tooltip: 'Filter Deals',
              ),
              if (provider.activeFilterCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${provider.activeFilterCount}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // ── 1. Controls Header: Count & Sort Dropdown ──
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Showing ${products.length} active deals',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted,
                  ),
                ),

                // Sort Dropdown
                DropdownButton<String>(
                  value: provider.currentSort,
                  underline: const SizedBox.shrink(),
                  icon: const Icon(Icons.arrow_drop_down, size: 18),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textMain,
                  ),
                  items: AppConstants.sortOptions.map((opt) {
                    return DropdownMenuItem<String>(
                      value: opt.value,
                      child: Text(opt.label),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) provider.setSort(val);
                  },
                ),
              ],
            ),
          ),

          // ── 2. Mobile Quick Filter Horizontal Pills ──
          Container(
            color: Colors.white,
            height: 38,
            padding: const EdgeInsets.only(left: 12, bottom: 6),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildQuickFilterPill(
                  label: 'All',
                  isActive: provider.minDiscount.isEmpty && !provider.inStockOnly,
                  onTap: () {
                    provider.setMinDiscount('');
                    provider.setInStockOnly(false);
                  },
                ),
                _buildQuickFilterPill(
                  label: '80%+ OFF',
                  isActive: provider.minDiscount == '80',
                  onTap: () => provider.setMinDiscount(
                      provider.minDiscount == '80' ? '' : '80'),
                ),
                _buildQuickFilterPill(
                  label: '70%+ OFF',
                  isActive: provider.minDiscount == '70',
                  onTap: () => provider.setMinDiscount(
                      provider.minDiscount == '70' ? '' : '70'),
                ),
                _buildQuickFilterPill(
                  label: '50%+ OFF',
                  isActive: provider.minDiscount == '50',
                  onTap: () => provider.setMinDiscount(
                      provider.minDiscount == '50' ? '' : '50'),
                ),
                _buildQuickFilterPill(
                  label: 'In Stock',
                  isActive: provider.inStockOnly,
                  onTap: () => provider.setInStockOnly(!provider.inStockOnly),
                ),
              ],
            ),
          ),

          // ── 3. Active Filters Chips ──
          if (provider.activeFilterCount > 0)
            Container(
              color: AppColors.bgSubtle,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: SizedBox(
                height: 28,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 5, right: 6),
                      child: Text(
                        'Active:',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ),
                    if (provider.searchTerm.isNotEmpty)
                      _buildActiveChip(
                        '"${provider.searchTerm}"',
                        () => provider.setSearchTerm(''),
                      ),
                    if (provider.minDiscount.isNotEmpty)
                      _buildActiveChip(
                        '${provider.minDiscount}%+ OFF',
                        () => provider.setMinDiscount(''),
                      ),
                    if (provider.selectedCategoryName.isNotEmpty)
                      _buildActiveChip(
                        provider.selectedCategoryName,
                        () => provider.setCategory(null),
                      ),
                    if (provider.selectedMarketplaceName.isNotEmpty)
                      _buildActiveChip(
                        provider.selectedMarketplaceName,
                        () => provider.setMarketplace(null),
                      ),
                    if (provider.maxPrice.isNotEmpty)
                      _buildActiveChip(
                        '≤ ₹${provider.maxPrice}',
                        () => provider.setMaxPrice(''),
                      ),
                    if (provider.inStockOnly)
                      _buildActiveChip(
                        'In Stock',
                        () => provider.setInStockOnly(false),
                      ),
                    TextButton(
                      onPressed: () => provider.resetFilters(),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text(
                        'Clear All',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // ── 4. Deals Grid ──
          Expanded(
            child: RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () => provider.fetchDeals(),
              child: provider.errorMessage != null
                  ? SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: ErrorStateView(
                        title: 'Error Loading Deals',
                        message: provider.errorMessage!,
                        onRetry: () => provider.fetchDeals(),
                      ),
                    )
                  : ProductGrid(
                      products: products,
                      loading: provider.isLoading,
                      skeletonCount: 8,
                      emptyTitle: 'No Qualifying Deals Match',
                      emptyDescription:
                          'Try adjusting your filters or minimum discount threshold to see more deals.',
                      onResetFilters: () => provider.resetFilters(),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickFilterPill({
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : AppColors.bgSubtle,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isActive ? AppColors.primary : AppColors.border,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
              color: isActive ? Colors.white : AppColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActiveChip(String label, VoidCallback onRemove) {
    return Container(
      margin: const EdgeInsets.only(right: 6),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: AppColors.textMain,
            ),
          ),
          const SizedBox(width: 4),
          InkWell(
            onTap: onRemove,
            child: const Icon(
              Icons.close,
              size: 11,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _DealsFilterModal extends StatefulWidget {
  const _DealsFilterModal();

  @override
  State<_DealsFilterModal> createState() => _DealsFilterModalState();
}

class _DealsFilterModalState extends State<_DealsFilterModal> {
  late TextEditingController _searchCtrl;
  late TextEditingController _priceCtrl;

  @override
  void initState() {
    super.initState();
    final p = context.read<DealsFilterProvider>();
    _searchCtrl = TextEditingController(text: p.searchTerm);
    _priceCtrl = TextEditingController(text: p.maxPrice);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _priceCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<DealsFilterProvider>();

    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        child: Column(
          children: [
            // Modal Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(CupertinoIcons.slider_horizontal_3,
                        size: 18, color: AppColors.primary),
                    const SizedBox(width: 8),
                    const Text(
                      'Filter Deals',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textMain,
                      ),
                    ),
                    if (p.activeFilterCount > 0)
                      Container(
                        margin: const EdgeInsets.only(left: 6),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${p.activeFilterCount}',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                  ],
                ),
                Row(
                  children: [
                    if (p.activeFilterCount > 0)
                      TextButton(
                        onPressed: () {
                          p.resetFilters();
                          _searchCtrl.clear();
                          _priceCtrl.clear();
                        },
                        child: const Text(
                          'Reset All',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.danger,
                          ),
                        ),
                      ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ],
            ),
            const Divider(color: AppColors.border),

            // Scrollable filter groups
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Search in Deals
                    const Text(
                      'Search in Deals',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _searchCtrl,
                      decoration: InputDecoration(
                        hintText: 'Keywords, brand...',
                        prefixIcon: const Icon(CupertinoIcons.search, size: 16),
                        suffixIcon: _searchCtrl.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, size: 16),
                                onPressed: () {
                                  _searchCtrl.clear();
                                  p.setSearchTerm('');
                                },
                              )
                            : null,
                      ),
                      onChanged: (val) => p.setSearchTerm(val),
                    ),
                    const SizedBox(height: 16),

                    // Minimum Discount Grid
                    const Text(
                      'Minimum Discount',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: AppConstants.discountFilterOptions.map((opt) {
                        final isSel = p.minDiscount == opt.value;
                        return ChoiceChip(
                          label: Text(opt.label),
                          selected: isSel,
                          selectedColor: AppColors.primary,
                          labelStyle: TextStyle(
                            color: isSel ? Colors.white : AppColors.textMain,
                            fontWeight: isSel ? FontWeight.w800 : FontWeight.w500,
                            fontSize: 11.5,
                          ),
                          onSelected: (_) => p.setMinDiscount(opt.value),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    // Categories List
                    if (p.categories.isNotEmpty) ...[
                      const Text(
                        'Categories',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 6),
                      InkWell(
                        onTap: () => p.setCategory(null),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          margin: const EdgeInsets.only(bottom: 4),
                          decoration: BoxDecoration(
                            color: p.selectedCategoryId == null ? AppColors.primaryLight : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: p.selectedCategoryId == null ? AppColors.primary : Colors.transparent,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                p.selectedCategoryId == null ? Icons.radio_button_checked : Icons.radio_button_off,
                                size: 16,
                                color: p.selectedCategoryId == null ? AppColors.primary : AppColors.textMuted,
                              ),
                              const SizedBox(width: 8),
                              const Text('All Categories', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                      ...p.categories.map((cat) {
                        final isSel = p.selectedCategoryId == cat.id;
                        return InkWell(
                          onTap: () => p.setCategory(cat.id),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            margin: const EdgeInsets.only(bottom: 4),
                            decoration: BoxDecoration(
                              color: isSel ? AppColors.primaryLight : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSel ? AppColors.primary : Colors.transparent,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  isSel ? Icons.radio_button_checked : Icons.radio_button_off,
                                  size: 16,
                                  color: isSel ? AppColors.primary : AppColors.textMuted,
                                ),
                                const SizedBox(width: 8),
                                CategoryStrokeIconWidget(
                                  name: cat.name,
                                  size: 14,
                                  color: isSel ? AppColors.primary : AppColors.textSecondary,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    cat.name,
                                    style: TextStyle(
                                      fontSize: 12.5,
                                      fontWeight: isSel ? FontWeight.w800 : FontWeight.w500,
                                      color: isSel ? AppColors.primary : AppColors.textMain,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                      const SizedBox(height: 16),
                    ],

                    // Marketplaces List
                    if (p.marketplaces.isNotEmpty) ...[
                      const Text(
                        'Stores & Marketplaces',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 6),
                      InkWell(
                        onTap: () => p.setMarketplace(null),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          margin: const EdgeInsets.only(bottom: 4),
                          decoration: BoxDecoration(
                            color: p.selectedMarketplaceId == null ? AppColors.primaryLight : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: p.selectedMarketplaceId == null ? AppColors.primary : Colors.transparent,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                p.selectedMarketplaceId == null ? Icons.radio_button_checked : Icons.radio_button_off,
                                size: 16,
                                color: p.selectedMarketplaceId == null ? AppColors.primary : AppColors.textMuted,
                              ),
                              const SizedBox(width: 8),
                              const Text('All Stores', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                      ...p.marketplaces.map((mkt) {
                        final isSel = p.selectedMarketplaceId == mkt.id;
                        return InkWell(
                          onTap: () => p.setMarketplace(mkt.id),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            margin: const EdgeInsets.only(bottom: 4),
                            decoration: BoxDecoration(
                              color: isSel ? AppColors.primaryLight : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSel ? AppColors.primary : Colors.transparent,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  isSel ? Icons.radio_button_checked : Icons.radio_button_off,
                                  size: 16,
                                  color: isSel ? AppColors.primary : AppColors.textMuted,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  mkt.name,
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: isSel ? FontWeight.w800 : FontWeight.w500,
                                    color: isSel ? AppColors.primary : AppColors.textMain,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                      const SizedBox(height: 16),
                    ],

                    // Max Price (₹)
                    const Text(
                      'Max Price (₹)',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _priceCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        hintText: 'e.g. 1999',
                        prefixText: '₹ ',
                      ),
                      onChanged: (val) => p.setMaxPrice(val),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      children: [500, 1000, 2000, 5000].map((val) {
                        final isSel = p.maxPrice == val.toString();
                        return ActionChip(
                          label: Text('≤ ₹$val'),
                          backgroundColor:
                              isSel ? AppColors.primaryLight : AppColors.bgSubtle,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6),
                            side: BorderSide(
                              color: isSel ? AppColors.primary : AppColors.border,
                            ),
                          ),
                          labelStyle: TextStyle(
                            color: isSel ? AppColors.primary : AppColors.textMain,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                          onPressed: () {
                            final next = isSel ? '' : val.toString();
                            _priceCtrl.text = next;
                            p.setMaxPrice(next);
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    // In Stock Only Toggle
                    SwitchListTile(
                      title: const Text(
                        'In Stock Only',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                      ),
                      subtitle: const Text(
                        'Hide currently out-of-stock deals',
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                      value: p.inStockOnly,
                      activeThumbColor: AppColors.primary,
                      onChanged: (val) => p.setInStockOnly(val),
                      contentPadding: EdgeInsets.zero,
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Apply Button
            Container(
              padding: const EdgeInsets.only(top: 8),
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                ),
                child: Text(
                  'Apply Filters (${p.filteredProducts.length} Deals)',
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
