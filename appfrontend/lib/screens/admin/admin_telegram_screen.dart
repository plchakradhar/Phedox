import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/telegram_post_model.dart';
import '../../services/telegram_service.dart';
import '../../widgets/admin/admin_drawer.dart';
import '../../widgets/admin/status_badge.dart';
import '../../widgets/common/error_state_view.dart';
import 'admin_telegram_detail_screen.dart';

class AdminTelegramScreen extends StatefulWidget {
  const AdminTelegramScreen({super.key});

  @override
  State<AdminTelegramScreen> createState() => _AdminTelegramScreenState();
}

class _AdminTelegramScreenState extends State<AdminTelegramScreen> {
  final TelegramService _telegramService = TelegramService();
  List<TelegramPostModel> _posts = [];
  bool _loading = true;
  String? _error;
  String _selectedStatus = 'ALL';

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  Future<void> _fetchPosts() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final posts = await _telegramService.getPostsByStatus(_selectedStatus);
      if (mounted) {
        setState(() {
          _posts = posts;
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

  void _showIngestDialog() {
    final channelCtrl = TextEditingController(text: '@TopDealsChannel');
    final msgCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Simulate Ingesting Deal Post'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: channelCtrl,
                decoration: const InputDecoration(labelText: 'Telegram Channel'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: msgCtrl,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: 'Deal Message Text & URL *',
                  hintText: '🔥 80% OFF on Noise Smartwatch\nBuy here: https://fkrt.it/...',
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final text = msgCtrl.text.trim();
              if (text.isEmpty) return;
              Navigator.of(ctx).pop();
              try {
                await _telegramService.receivePost({
                  'channelName': channelCtrl.text.trim(),
                  'messageText': text,
                  'messageId': DateTime.now().millisecondsSinceEpoch.toString(),
                });
                _fetchPosts();
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.danger),
                  );
                }
              }
            },
            child: const Text('Ingest'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleProcess(dynamic id) async {
    try {
      await _telegramService.processPostManually(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Processing completed / triggered!'),
            backgroundColor: AppColors.successDark,
          ),
        );
        _fetchPosts();
      }
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Telegram Deal Ingestion', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(CupertinoIcons.plus),
            onPressed: _showIngestDialog,
            tooltip: 'Ingest Post',
          ),
          IconButton(
            icon: const Icon(CupertinoIcons.refresh),
            onPressed: _fetchPosts,
            tooltip: 'Refresh',
          ),
        ],
      ),
      drawer: const AdminDrawer(activeRoute: 'telegram'),
      body: Column(
        children: [
          // Status filter tabs
          Container(
            color: Colors.white,
            height: 42,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              children: ['ALL', 'RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED'].map((st) {
                final isSel = _selectedStatus == st;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ChoiceChip(
                    label: Text(st),
                    selected: isSel,
                    selectedColor: AppColors.primary,
                    labelStyle: TextStyle(
                      color: isSel ? Colors.white : AppColors.textSecondary,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w800,
                    ),
                    onSelected: (_) {
                      setState(() => _selectedStatus = st);
                      _fetchPosts();
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          Expanded(
            child: RefreshIndicator(
              color: AppColors.primary,
              onRefresh: _fetchPosts,
              child: _error != null
                  ? SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: ErrorStateView(
                        title: 'Telegram Ingestion Notice',
                        message: _error!,
                        onRetry: _fetchPosts,
                      ),
                    )
                  : _loading
                      ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                      : _posts.isEmpty
                          ? const Center(
                              child: Text(
                                'No Telegram deal posts found.',
                                style: TextStyle(color: AppColors.textMuted),
                              ),
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.all(12),
                              itemCount: _posts.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 8),
                              itemBuilder: (context, idx) {
                                final post = _posts[idx];
                                return InkWell(
                                  onTap: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => AdminTelegramDetailScreen(postId: post.id),
                                      ),
                                    ).then((_) => _fetchPosts());
                                  },
                                  child: Container(
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
                                            Text(
                                              '#${post.id} • ${post.channelName ?? 'Telegram'}',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w800,
                                                fontSize: 12.5,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                            StatusBadge(status: post.status),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          post.messageText ?? '',
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              'Store: ${post.marketplace ?? 'Auto-detect'} • ${DateFormatter.formatRelativeTime(post.receivedAt)}',
                                              style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                                            ),
                                            if (post.status != 'PROCESSED')
                                              ElevatedButton.icon(
                                                icon: const Icon(CupertinoIcons.play_arrow_solid, size: 10),
                                                label: const Text('Process'),
                                                onPressed: () => _handleProcess(post.id),
                                                style: ElevatedButton.styleFrom(
                                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                  textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800),
                                                ),
                                              ),
                                          ],
                                        ),
                                      ],
                                    ),
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
