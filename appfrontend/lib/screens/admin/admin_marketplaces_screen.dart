import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/marketplace_model.dart';
import '../../services/marketplace_service.dart';
import '../../widgets/admin/admin_drawer.dart';
import '../../widgets/common/error_state_view.dart';

class AdminMarketplacesScreen extends StatefulWidget {
  const AdminMarketplacesScreen({super.key});

  @override
  State<AdminMarketplacesScreen> createState() => _AdminMarketplacesScreenState();
}

class _AdminMarketplacesScreenState extends State<AdminMarketplacesScreen> {
  final MarketplaceService _marketplaceService = MarketplaceService();
  List<MarketplaceModel> _marketplaces = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchMarketplaces();
  }

  Future<void> _fetchMarketplaces() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final mkts = await _marketplaceService.getMarketplaces();
      if (mounted) {
        setState(() {
          _marketplaces = mkts;
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

  void _showAddMarketplaceDialog([MarketplaceModel? mkt]) {
    final nameCtrl = TextEditingController(text: mkt?.name ?? '');
    final codeCtrl = TextEditingController(text: mkt?.code ?? '');
    final tagCtrl = TextEditingController(text: mkt?.affiliateTag ?? '');
    final urlCtrl = TextEditingController(text: mkt?.baseUrl ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(mkt == null ? 'Add Marketplace' : 'Edit Marketplace'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Name (e.g. Flipkart)')),
              const SizedBox(height: 8),
              TextField(controller: codeCtrl, decoration: const InputDecoration(labelText: 'Code (e.g. FLIPKART)')),
              const SizedBox(height: 8),
              TextField(controller: tagCtrl, decoration: const InputDecoration(labelText: 'Affiliate Tag ID')),
              const SizedBox(height: 8),
              TextField(controller: urlCtrl, decoration: const InputDecoration(labelText: 'Base Domain URL')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final name = nameCtrl.text.trim();
              if (name.isEmpty) return;
              Navigator.of(ctx).pop();
              try {
                final payload = {
                  'name': name,
                  'code': codeCtrl.text.trim().toUpperCase(),
                  'affiliateTag': tagCtrl.text.trim(),
                  'baseUrl': urlCtrl.text.trim(),
                };
                if (mkt != null) {
                  await _marketplaceService.updateMarketplace(mkt.id, payload);
                } else {
                  await _marketplaceService.createMarketplace(payload);
                }
                _fetchMarketplaces();
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
        title: const Text('Marketplaces & Stores', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.plus),
            onPressed: () => _showAddMarketplaceDialog(),
            tooltip: 'Add Marketplace',
          ),
          IconButton(
            icon: const Icon(CupertinoIcons.refresh),
            onPressed: _fetchMarketplaces,
            tooltip: 'Refresh',
          ),
        ],
      ),
      drawer: const AdminDrawer(activeRoute: 'marketplaces'),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _fetchMarketplaces,
        child: _error != null
            ? SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: ErrorStateView(
                  title: 'Marketplaces Error',
                  message: _error!,
                  onRetry: _fetchMarketplaces,
                ),
              )
            : _loading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: _marketplaces.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (context, idx) {
                      final m = _marketplaces[idx];
                      final color = AppColors.getMarketplaceColor(m.name);
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(Icons.storefront, color: color, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    m.name,
                                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                                  ),
                                  Text(
                                    'Tag: ${m.affiliateTag ?? 'Default'} • ${m.baseUrl ?? 'N/A'}',
                                    style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(CupertinoIcons.pencil, size: 16),
                              onPressed: () => _showAddMarketplaceDialog(m),
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
