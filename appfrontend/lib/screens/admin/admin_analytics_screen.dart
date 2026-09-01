import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/analytics_model.dart';
import '../../services/telegram_service.dart';
import '../../widgets/admin/admin_drawer.dart';
import '../../widgets/admin/kpi_card.dart';

class AdminAnalyticsScreen extends StatefulWidget {
  const AdminAnalyticsScreen({super.key});

  @override
  State<AdminAnalyticsScreen> createState() => _AdminAnalyticsScreenState();
}

class _AdminAnalyticsScreenState extends State<AdminAnalyticsScreen> {
  final TelegramService _telegramService = TelegramService();
  DashboardAnalyticsModel? _analytics;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadAnalytics();
  }

  Future<void> _loadAnalytics() async {
    setState(() => _loading = true);
    try {
      final a = await _telegramService.getDashboardAnalytics();
      if (mounted) {
        setState(() {
          _analytics = a;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analytics & Click Tracking', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(icon: const Icon(CupertinoIcons.refresh), onPressed: _loadAnalytics),
        ],
      ),
      drawer: const AdminDrawer(activeRoute: 'analytics'),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _loadAnalytics,
        child: _loading
            ? const Center(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              )
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(14),
                child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 1.35,
                children: [
                  KPICard(
                    title: 'Total Tracked Clicks',
                    value: _analytics?.totalClicks ?? 0,
                    icon: CupertinoIcons.cursor_rays,
                    color: const Color(0xFF10B981),
                    bgColor: const Color(0xFFECFDF5),
                  ),
                  KPICard(
                    title: 'Live Active Products',
                    value: _analytics?.totalActiveProducts ?? 0,
                    icon: CupertinoIcons.cube_box_fill,
                    color: const Color(0xFF2563EB),
                    bgColor: const Color(0xFFEFF6FF),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Clicks Breakdown Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Clicks by Marketplace',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                    ),
                    const Divider(color: AppColors.border, height: 16),
                    if (_analytics?.clicksByMarketplace == null ||
                        _analytics!.clicksByMarketplace!.isEmpty)
                      const Text(
                        'No click data recorded yet. Clicks are logged when users tap "Buy Now".',
                        style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                      )
                    else
                      ..._analytics!.clicksByMarketplace!.entries.map((e) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(e.key, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
                              Text('${e.value} clicks', style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary)),
                            ],
                          ),
                        );
                      }),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Categories Distribution Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Products by Category',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                    ),
                    const Divider(color: AppColors.border, height: 16),
                    if (_analytics?.productsByCategory == null ||
                        _analytics!.productsByCategory!.isEmpty)
                      const Text(
                        'Category distribution loading...',
                        style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                      )
                    else
                      ..._analytics!.productsByCategory!.entries.map((e) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(e.key, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
                              Text('${e.value} deals', style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.textSecondary)),
                            ],
                          ),
                        );
                      }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
