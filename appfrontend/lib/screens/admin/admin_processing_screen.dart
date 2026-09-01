import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/telegram_post_model.dart';
import '../../services/telegram_service.dart';
import '../../widgets/admin/admin_drawer.dart';
import '../../widgets/admin/status_badge.dart';

class AdminProcessingScreen extends StatefulWidget {
  const AdminProcessingScreen({super.key});

  @override
  State<AdminProcessingScreen> createState() => _AdminProcessingScreenState();
}

class _AdminProcessingScreenState extends State<AdminProcessingScreen> {
  final TelegramService _telegramService = TelegramService();
  List<TelegramPostModel> _processingPosts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProcessing();
  }

  Future<void> _loadProcessing() async {
    setState(() => _loading = true);
    try {
      final posts = await _telegramService.getAllPosts();
      if (mounted) {
        setState(() {
          _processingPosts = posts
              .where((p) => p.status == 'PROCESSING' || p.status == 'RECEIVED')
              .toList();
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
        title: const Text('Processing Pipeline', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(icon: const Icon(CupertinoIcons.refresh), onPressed: _loadProcessing),
        ],
      ),
      drawer: const AdminDrawer(activeRoute: 'processing'),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _loadProcessing,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Pipeline Overview Card
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
                    const Text('Deal Ingestion Workflow', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 8),
                    const Text(
                      '1. Telegram webhook / polling ingests deal post.\n'
                      '2. URL resolution unshortens affiliate tokens and handles redirects.\n'
                      '3. Scraper engine fetches real-time MRP, deal price, and images.\n'
                      '4. Price Intelligence checks 50%+ discount threshold.\n'
                      '5. Qualifying deals published to live customer feed.',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              const Text('Active Queue Backlog', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),

              if (_loading)
                const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
              else if (_processingPosts.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.check_circle, color: AppColors.successDark, size: 36),
                      SizedBox(height: 8),
                      Text('Queue is Clean', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                      Text('All ingested deals are fully processed.', style: TextStyle(color: AppColors.textMuted, fontSize: 11.5)),
                    ],
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _processingPosts.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 8),
                  itemBuilder: (context, idx) {
                    final p = _processingPosts[idx];
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Post #${p.id} • ${p.channelName ?? 'Channel'}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12.5)),
                                Text(p.messageText ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                              ],
                            ),
                          ),
                          StatusBadge(status: p.status),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
