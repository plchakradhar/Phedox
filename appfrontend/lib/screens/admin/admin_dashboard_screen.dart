import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/analytics_model.dart';
import '../../models/product_model.dart';
import '../../models/telegram_post_model.dart';
import '../../services/telegram_service.dart';
import '../../services/product_service.dart';
import '../../widgets/admin/kpi_card.dart';
import '../../widgets/admin/status_badge.dart';
import '../../widgets/admin/admin_drawer.dart';
import '../../widgets/common/error_state_view.dart';
import 'admin_products_screen.dart';
import 'admin_telegram_screen.dart';
import 'admin_telegram_detail_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final TelegramService _telegramService = TelegramService();
  final ProductService _productService = ProductService();

  DashboardAnalyticsModel? _analytics;
  List<ProductModel> _recentProducts = [];
  List<TelegramPostModel> _recentPosts = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final results = await Future.wait([
        _telegramService.getDashboardAnalytics(),
        _productService.getProducts(minDiscount: '50'),
        _telegramService.getAllPosts(),
      ]);

      if (mounted) {
        setState(() {
          _analytics = results[0] as DashboardAnalyticsModel;
          _recentProducts = (results[1] as List<ProductModel>).take(5).toList();
          _recentPosts = (results[2] as List<TelegramPostModel>).take(5).toList();
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

  Future<void> _handleProcessPost(dynamic postId) async {
    try {
      await _telegramService.processPostManually(postId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Triggered processing for post #$postId'),
            backgroundColor: AppColors.successDark,
          ),
        );
        _loadDashboardData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to process post: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final pendingCount = _recentPosts
        .where((p) => p.status == 'RECEIVED' || p.status == 'PROCESSING')
        .length;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Admin Dashboard',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17),
        ),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.refresh),
            onPressed: _loadDashboardData,
            tooltip: 'Refresh Metrics',
          ),
        ],
      ),
      drawer: const AdminDrawer(activeRoute: 'dashboard'),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _loadDashboardData,
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
                    if (_error != null)
                      ErrorStateView(
                        title: 'Dashboard Error',
                        message: _error!,
                        onRetry: _loadDashboardData,
                      ),

              // ── 1. KPI Telemetry Grid ──
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 1.35,
                children: [
                  KPICard(
                    title: 'Active Live Deals',
                    value: _analytics?.totalActiveProducts ?? _recentProducts.length,
                    icon: CupertinoIcons.cube_box_fill,
                    color: const Color(0xFF2563EB),
                    bgColor: const Color(0xFFEFF6FF),
                    subText: 'Live on store',
                  ),
                  KPICard(
                    title: 'Affiliate Clicks',
                    value: _analytics?.totalClicks ?? 0,
                    icon: CupertinoIcons.cursor_rays,
                    color: const Color(0xFF10B981),
                    bgColor: const Color(0xFFECFDF5),
                    subText: 'Direct merchant redirects',
                  ),
                  KPICard(
                    title: 'Telegram Posts',
                    value: _analytics?.totalTelegramPosts ?? _recentPosts.length,
                    icon: CupertinoIcons.paperplane_fill,
                    color: const Color(0xFF8B5CF6),
                    bgColor: const Color(0xFFF5F3FF),
                    subText: 'Ingested deals',
                  ),
                  KPICard(
                    title: 'Pending Queue',
                    value: pendingCount,
                    icon: CupertinoIcons.clock_fill,
                    color: const Color(0xFFF59E0B),
                    bgColor: const Color(0xFFFFFBEB),
                    subText: 'Queue backlog',
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // ── 2. Recent 50%+ Qualifying Deals ──
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Recent 50%+ Deals',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textMain,
                          ),
                        ),
                        InkWell(
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => const AdminProductsScreen(),
                              ),
                            );
                          },
                          child: const Row(
                            children: [
                              Text(
                                'View All',
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                ),
                              ),
                              Icon(Icons.arrow_forward, size: 12, color: AppColors.primary),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Divider(color: AppColors.border, height: 16),
                    if (_recentProducts.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(12),
                        child: Text(
                          'No recent deals found.',
                          style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _recentProducts.length,
                        separatorBuilder: (context, index) => const Divider(color: AppColors.border, height: 12),
                        itemBuilder: (context, idx) {
                          final prod = _recentProducts[idx];
                          return Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      prod.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 12.5,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Row(
                                      children: [
                                        Text(
                                          CurrencyFormatter.format(prod.currentPrice),
                                          style: const TextStyle(
                                            fontSize: 11.5,
                                            fontWeight: FontWeight.w800,
                                            color: AppColors.textMain,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          '${prod.parsedDiscount}% OFF',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w800,
                                            color: AppColors.danger,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          prod.marketplaceName ?? '',
                                          style: const TextStyle(
                                            fontSize: 10.5,
                                            color: AppColors.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              StatusBadge(status: prod.status),
                            ],
                          );
                        },
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // ── 3. Recent Telegram Ingestions ──
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Recent Telegram Ingestions',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textMain,
                          ),
                        ),
                        InkWell(
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => const AdminTelegramScreen(),
                              ),
                            );
                          },
                          child: const Row(
                            children: [
                              Text(
                                'All Posts',
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                ),
                              ),
                              Icon(Icons.arrow_forward, size: 12, color: AppColors.primary),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Divider(color: AppColors.border, height: 16),
                    if (_recentPosts.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(12),
                        child: Text(
                          'No Telegram posts ingested yet.',
                          style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _recentPosts.length,
                        separatorBuilder: (context, index) => const Divider(color: AppColors.border, height: 12),
                        itemBuilder: (context, idx) {
                          final post = _recentPosts[idx];
                          return InkWell(
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) =>
                                      AdminTelegramDetailScreen(postId: post.id),
                                ),
                              );
                            },
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '#${post.id} • ${post.marketplace ?? 'Auto-Detect'}',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        post.messageText ?? 'Telegram Deal Post',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        DateFormatter.formatRelativeTime(post.receivedAt),
                                        style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                                      ),
                                    ],
                                  ),
                                ),
                                StatusBadge(status: post.status),
                                if (post.status != 'PROCESSED') ...[
                                  const SizedBox(width: 8),
                                  IconButton(
                                    icon: const Icon(CupertinoIcons.play_circle_fill, color: AppColors.primary, size: 22),
                                    onPressed: () => _handleProcessPost(post.id),
                                    tooltip: 'Run Pipeline',
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // ── 4. System Health & Schedulers ──
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _buildSchedulerRow('Price & Stock Scheduler', 'Runs Hourly (Every 60m)', true),
                    const Divider(color: AppColors.border, height: 16),
                    _buildSchedulerRow('Dead Link Verifier', 'Auto-deactivates 404s', true),
                    const Divider(color: AppColors.border, height: 16),
                    _buildSchedulerRow('Scrapers Enabled', 'Amazon, Flipkart, Myntra', true),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSchedulerRow(String title, String subtitle, bool isHealthy) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isHealthy ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
            shape: BoxShape.circle,
          ),
          child: Icon(
            isHealthy ? Icons.check_circle : Icons.error,
            color: isHealthy ? const Color(0xFF10B981) : AppColors.danger,
            size: 18,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
              ),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
