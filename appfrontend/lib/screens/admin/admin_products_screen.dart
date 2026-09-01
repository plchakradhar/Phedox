import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/product_model.dart';
import '../../services/product_service.dart';
import '../../widgets/admin/admin_drawer.dart';
import '../../widgets/admin/status_badge.dart';
import '../../widgets/common/error_state_view.dart';
import 'admin_product_edit_screen.dart';

class AdminProductsScreen extends StatefulWidget {
  const AdminProductsScreen({super.key});

  @override
  State<AdminProductsScreen> createState() => _AdminProductsScreenState();
}

class _AdminProductsScreenState extends State<AdminProductsScreen> {
  final ProductService _productService = ProductService();
  List<ProductModel> _products = [];
  bool _loading = true;
  String? _error;
  String _searchTerm = '';

  @override
  void initState() {
    super.initState();
    _fetchAdminProducts();
  }

  Future<void> _fetchAdminProducts() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final prods = await _productService.getAllAdminProducts();
      if (mounted) {
        setState(() {
          _products = prods;
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

  Future<void> _handleDeactivate(dynamic id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Deactivate Deal'),
        content: const Text('Are you sure you want to deactivate this product from live listings?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('Deactivate'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await _productService.deactivateProduct(id);
      _fetchAdminProducts();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.danger),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _products.where((p) {
      if (_searchTerm.isEmpty) return true;
      return p.name.toLowerCase().contains(_searchTerm.toLowerCase()) ||
          (p.marketplaceName ?? '').toLowerCase().contains(_searchTerm.toLowerCase()) ||
          (p.categoryName ?? '').toLowerCase().contains(_searchTerm.toLowerCase());
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Products Management', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.plus),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const AdminProductEditScreen()),
              ).then((_) => _fetchAdminProducts());
            },
            tooltip: 'Add Product',
          ),
          IconButton(
            icon: const Icon(CupertinoIcons.refresh),
            onPressed: _fetchAdminProducts,
            tooltip: 'Refresh',
          ),
        ],
      ),
      drawer: const AdminDrawer(activeRoute: 'products'),
      body: Column(
        children: [
          // Search filter bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Search products by title, category, store...',
                prefixIcon: Icon(CupertinoIcons.search, size: 16),
                contentPadding: EdgeInsets.symmetric(vertical: 8),
              ),
              onChanged: (val) => setState(() => _searchTerm = val.trim()),
            ),
          ),

          Expanded(
            child: RefreshIndicator(
              color: AppColors.primary,
              onRefresh: _fetchAdminProducts,
              child: _error != null
                  ? SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: ErrorStateView(
                        title: 'Products Notice',
                        message: _error!,
                        onRetry: _fetchAdminProducts,
                      ),
                    )
                  : _loading
                      ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                      : filtered.isEmpty
                          ? const Center(
                              child: Text(
                                'No products found.',
                                style: TextStyle(color: AppColors.textMuted),
                              ),
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.all(12),
                              itemCount: filtered.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 8),
                              itemBuilder: (context, idx) {
                                final p = filtered[idx];
                                return Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: AppColors.border),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              p.name,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w800,
                                              ),
                                            ),
                                          ),
                                          StatusBadge(status: p.status),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Text(
                                            CurrencyFormatter.format(p.currentPrice),
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w900,
                                              fontSize: 13,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            '${p.parsedDiscount}% OFF',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w800,
                                              fontSize: 11,
                                              color: AppColors.danger,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            p.marketplaceName ?? 'Store',
                                            style: const TextStyle(
                                              fontSize: 11,
                                              color: AppColors.textMuted,
                                            ),
                                          ),
                                          const Spacer(),
                                          IconButton(
                                            icon: const Icon(CupertinoIcons.pencil, size: 16),
                                            onPressed: () {
                                              Navigator.of(context).push(
                                                MaterialPageRoute(
                                                  builder: (_) => AdminProductEditScreen(product: p),
                                                ),
                                              ).then((_) => _fetchAdminProducts());
                                            },
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(),
                                            tooltip: 'Edit',
                                          ),
                                          const SizedBox(width: 12),
                                          IconButton(
                                            icon: const Icon(CupertinoIcons.trash, size: 16, color: AppColors.danger),
                                            onPressed: () => _handleDeactivate(p.id),
                                            padding: EdgeInsets.zero,
                                            constraints: const BoxConstraints(),
                                            tooltip: 'Deactivate',
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
            ),
          ),
        ],
      ),
    );
  }
}
