import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/category_model.dart';
import '../../services/category_service.dart';
import '../../widgets/admin/admin_drawer.dart';
import '../../widgets/common/category_stroke_icon_widget.dart';
import '../../widgets/common/error_state_view.dart';

class AdminCategoriesScreen extends StatefulWidget {
  const AdminCategoriesScreen({super.key});

  @override
  State<AdminCategoriesScreen> createState() => _AdminCategoriesScreenState();
}

class _AdminCategoriesScreenState extends State<AdminCategoriesScreen> {
  final CategoryService _categoryService = CategoryService();
  List<CategoryModel> _categories = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchCategories();
  }

  Future<void> _fetchCategories() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final cats = await _categoryService.getCategories();
      if (mounted) {
        setState(() {
          _categories = cats;
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

  void _showAddCategoryDialog([CategoryModel? cat]) {
    final nameCtrl = TextEditingController(text: cat?.name ?? '');
    final descCtrl = TextEditingController(text: cat?.description ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(cat == null ? 'Add Category' : 'Edit Category'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(labelText: 'Category Name *'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: descCtrl,
              decoration: const InputDecoration(labelText: 'Description'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final name = nameCtrl.text.trim();
              if (name.isEmpty) return;
              Navigator.of(ctx).pop();
              try {
                if (cat != null) {
                  await _categoryService.updateCategory(cat.id, {
                    'name': name,
                    'description': descCtrl.text.trim(),
                  });
                } else {
                  await _categoryService.createCategory({
                    'name': name,
                    'description': descCtrl.text.trim(),
                  });
                }
                _fetchCategories();
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.danger),
                  );
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Deal Categories', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.plus),
            onPressed: () => _showAddCategoryDialog(),
            tooltip: 'Add Category',
          ),
          IconButton(
            icon: const Icon(CupertinoIcons.refresh),
            onPressed: _fetchCategories,
            tooltip: 'Refresh',
          ),
        ],
      ),
      drawer: const AdminDrawer(activeRoute: 'categories'),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchCategories,
        child: _error != null
            ? SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: ErrorStateView(
                  title: 'Categories Error',
                  message: _error!,
                  onRetry: _fetchCategories,
                ),
              )
            : _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: _categories.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (context, idx) {
                      final c = _categories[idx];
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            CategoryStrokeIconWidget(
                              name: c.name,
                              size: 20,
                              color: AppColors.primary,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    c.name,
                                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                                  ),
                                  if (c.description != null)
                                    Text(
                                      c.description!,
                                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                    ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(CupertinoIcons.pencil, size: 16),
                              onPressed: () => _showAddCategoryDialog(c),
                              tooltip: 'Edit',
                            ),
                          ],
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
