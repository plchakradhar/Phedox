import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/product_model.dart';
import '../../models/category_model.dart';
import '../../models/marketplace_model.dart';
import '../../services/product_service.dart';
import '../../services/category_service.dart';
import '../../services/marketplace_service.dart';

class AdminProductEditScreen extends StatefulWidget {
  final ProductModel? product;

  const AdminProductEditScreen({super.key, this.product});

  @override
  State<AdminProductEditScreen> createState() => _AdminProductEditScreenState();
}

class _AdminProductEditScreenState extends State<AdminProductEditScreen> {
  final ProductService _productService = ProductService();
  final CategoryService _categoryService = CategoryService();
  final MarketplaceService _marketplaceService = MarketplaceService();

  late TextEditingController _nameCtrl;
  late TextEditingController _descCtrl;
  late TextEditingController _currentPriceCtrl;
  late TextEditingController _origPriceCtrl;
  late TextEditingController _discountCtrl;
  late TextEditingController _productUrlCtrl;
  late TextEditingController _affiliateUrlCtrl;
  late TextEditingController _imgUrlCtrl;

  dynamic _selectedCategoryId;
  dynamic _selectedMarketplaceId;
  String _stockStatus = 'IN_STOCK';
  String _status = 'ACTIVE';

  List<CategoryModel> _categories = [];
  List<MarketplaceModel> _marketplaces = [];
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _nameCtrl = TextEditingController(text: p?.name ?? '');
    _descCtrl = TextEditingController(text: p?.description ?? '');
    _currentPriceCtrl = TextEditingController(text: p?.currentPrice?.toString() ?? '');
    _origPriceCtrl = TextEditingController(text: p?.originalPrice?.toString() ?? '');
    _discountCtrl = TextEditingController(text: p?.discountPercentage?.toString() ?? '');
    _productUrlCtrl = TextEditingController(text: p?.productUrl ?? '');
    _affiliateUrlCtrl = TextEditingController(text: p?.affiliateUrl ?? '');
    _imgUrlCtrl = TextEditingController(text: p?.primaryImageUrl ?? '');

    _selectedCategoryId = p?.categoryId;
    _selectedMarketplaceId = p?.marketplaceId;
    _stockStatus = p?.stockStatus ?? 'IN_STOCK';
    _status = p?.status ?? 'ACTIVE';

    _loadDropdowns();
  }

  Future<void> _loadDropdowns() async {
    try {
      final results = await Future.wait([
        _categoryService.getCategories(),
        _marketplaceService.getMarketplaces(),
      ]);
      if (mounted) {
        setState(() {
          _categories = results[0] as List<CategoryModel>;
          _marketplaces = results[1] as List<MarketplaceModel>;
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _currentPriceCtrl.dispose();
    _origPriceCtrl.dispose();
    _discountCtrl.dispose();
    _productUrlCtrl.dispose();
    _affiliateUrlCtrl.dispose();
    _imgUrlCtrl.dispose();
    super.dispose();
  }

  void _calculateDiscount() {
    final orig = double.tryParse(_origPriceCtrl.text.trim()) ?? 0;
    final curr = double.tryParse(_currentPriceCtrl.text.trim()) ?? 0;
    if (orig > 0 && curr > 0 && curr < orig) {
      final disc = (((orig - curr) / orig) * 100).round();
      _discountCtrl.text = disc.toString();
    }
  }

  Future<void> _handleSave() async {
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Product title is required')),
      );
      return;
    }

    setState(() => _submitting = true);

    final payload = {
      'name': name,
      'description': _descCtrl.text.trim(),
      'categoryId': _selectedCategoryId,
      'marketplaceId': _selectedMarketplaceId,
      'currentPrice': double.tryParse(_currentPriceCtrl.text.trim()) ?? 0,
      'originalPrice': double.tryParse(_origPriceCtrl.text.trim()) ?? 0,
      'discountPercentage': double.tryParse(_discountCtrl.text.trim()) ?? 0,
      'productUrl': _productUrlCtrl.text.trim(),
      'affiliateUrl': _affiliateUrlCtrl.text.trim(),
      'primaryImageUrl': _imgUrlCtrl.text.trim(),
      'stockStatus': _stockStatus,
      'status': _status,
    };

    try {
      if (widget.product != null) {
        await _productService.updateProduct(widget.product!.id, payload);
      } else {
        await _productService.createProduct(payload);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Product saved successfully!'),
            backgroundColor: AppColors.successDark,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.product != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Product Deal' : 'Add New Product Deal'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Product Title *', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            TextField(controller: _nameCtrl, decoration: const InputDecoration(hintText: 'e.g. Sony WH-1000XM5 Headphones')),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Current Price (₹) *', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _currentPriceCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(hintText: '1999', prefixText: '₹ '),
                        onChanged: (_) => _calculateDiscount(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Original MRP (₹) *', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _origPriceCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(hintText: '4999', prefixText: '₹ '),
                        onChanged: (_) => _calculateDiscount(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Discount (%)', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _discountCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(hintText: '60', suffixText: '%'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Category', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      DropdownButtonFormField<dynamic>(
                        initialValue: _selectedCategoryId,
                        decoration: const InputDecoration(),
                        items: _categories.map((c) {
                          return DropdownMenuItem(value: c.id, child: Text(c.name, style: const TextStyle(fontSize: 12.5)));
                        }).toList(),
                        onChanged: (val) => setState(() => _selectedCategoryId = val),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Marketplace', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      DropdownButtonFormField<dynamic>(
                        initialValue: _selectedMarketplaceId,
                        decoration: const InputDecoration(),
                        items: _marketplaces.map((m) {
                          return DropdownMenuItem(value: m.id, child: Text(m.name, style: const TextStyle(fontSize: 12.5)));
                        }).toList(),
                        onChanged: (val) => setState(() => _selectedMarketplaceId = val),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Stock Status', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      DropdownButtonFormField<String>(
                        initialValue: _stockStatus,
                        decoration: const InputDecoration(),
                        items: const [
                          DropdownMenuItem(value: 'IN_STOCK', child: Text('In Stock', style: TextStyle(fontSize: 12.5))),
                          DropdownMenuItem(value: 'OUT_OF_STOCK', child: Text('Out of Stock', style: TextStyle(fontSize: 12.5))),
                        ],
                        onChanged: (val) => setState(() => _stockStatus = val!),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            const Text('Image URL', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            TextField(controller: _imgUrlCtrl, decoration: const InputDecoration(hintText: 'https://...')),
            const SizedBox(height: 12),

            const Text('Original Product URL', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            TextField(controller: _productUrlCtrl, decoration: const InputDecoration(hintText: 'https://flipkart.com/...')),
            const SizedBox(height: 12),

            const Text('Affiliate Redirect URL', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            TextField(controller: _affiliateUrlCtrl, decoration: const InputDecoration(hintText: 'https://affiliate.flipkart.com/...')),
            const SizedBox(height: 12),

            const Text('Description', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            TextField(controller: _descCtrl, maxLines: 4, decoration: const InputDecoration(hintText: 'Key highlights...')),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                onPressed: _submitting ? null : _handleSave,
                child: _submitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(isEdit ? 'Update Product' : 'Create Product', style: const TextStyle(fontWeight: FontWeight.w800)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
