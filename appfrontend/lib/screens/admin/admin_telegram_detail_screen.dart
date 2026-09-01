import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../models/telegram_post_model.dart';
import '../../services/telegram_service.dart';
import '../../widgets/admin/status_badge.dart';
import '../../widgets/common/error_state_view.dart';
import '../customer/product_detail_screen.dart';

class AdminTelegramDetailScreen extends StatefulWidget {
  final dynamic postId;

  const AdminTelegramDetailScreen({super.key, required this.postId});

  @override
  State<AdminTelegramDetailScreen> createState() => _AdminTelegramDetailScreenState();
}

class _AdminTelegramDetailScreenState extends State<AdminTelegramDetailScreen> {
  final TelegramService _telegramService = TelegramService();
  TelegramPostModel? _post;
  bool _loading = true;
  String? _error;
  bool _processing = false;

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final p = await _telegramService.getPostById(widget.postId);
      if (mounted) {
        setState(() {
          _post = p;
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

  Future<void> _triggerProcess() async {
    setState(() => _processing = true);
    try {
      await _telegramService.processPostManually(widget.postId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Processing executed successfully!'),
            backgroundColor: AppColors.successDark,
          ),
        );
        _loadDetail();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Processing failed: $e'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _processing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: Text('Post #${widget.postId}')),
        body: const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    if (_error != null || _post == null) {
      return Scaffold(
        appBar: AppBar(title: Text('Post #${widget.postId}')),
        body: Center(
          child: ErrorStateView(
            title: 'Post Error',
            message: _error ?? 'Post not found',
            onRetry: _loadDetail,
          ),
        ),
      );
    }

    final p = _post!;

    return Scaffold(
      appBar: AppBar(
        title: Text('Post #${p.id} Details'),
        actions: [
          IconButton(icon: const Icon(CupertinoIcons.refresh), onPressed: _loadDetail),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Post #${p.id}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        p.channelName ?? 'Telegram Channel',
                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                  StatusBadge(status: p.status),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Ingestion Pipeline Info
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
                  const Text('Telemetry Details', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800)),
                  const Divider(color: AppColors.border, height: 16),
                  _buildDataRow('Detected Store', p.marketplace ?? 'Pending Detection'),
                  _buildDataRow('Received At', DateFormatter.formatDate(p.receivedAt)),
                  _buildDataRow('Processed At', DateFormatter.formatDate(p.processedAt)),
                  if (p.productId != null) ...[
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => ProductDetailScreen(productId: p.productId)),
                        );
                      },
                      child: Row(
                        children: [
                          const Icon(CupertinoIcons.cube_box, size: 14, color: AppColors.primary),
                          const SizedBox(width: 6),
                          Text(
                            'View Generated Product Deal #${p.productId}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  if (p.errorMessage != null && p.errorMessage!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.dangerLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Error: ${p.errorMessage}',
                        style: const TextStyle(color: AppColors.danger, fontSize: 11),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Raw Telegram Message Text
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
                  const Text('Raw Telegram Message', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.bgSubtle,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      p.messageText ?? 'No message body recorded.',
                      style: const TextStyle(fontSize: 12, height: 1.4),
                    ),
                  ),
                  if (p.extractedUrl != null) ...[
                    const SizedBox(height: 10),
                    const Text('Extracted URL:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                    Text(
                      p.extractedUrl!,
                      style: const TextStyle(fontSize: 11, color: Color(0xFF2563EB)),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Action Button
            if (p.status != 'PROCESSED')
              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton.icon(
                  icon: _processing
                      ? const SizedBox.shrink()
                      : const Icon(CupertinoIcons.play_arrow_solid, size: 16),
                  label: _processing
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Process Deal Now', style: TextStyle(fontWeight: FontWeight.w800)),
                  onPressed: _processing ? null : _triggerProcess,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted)),
          Text(val, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
