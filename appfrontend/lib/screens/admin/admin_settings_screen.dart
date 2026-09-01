import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/network/api_client.dart';
import '../../widgets/admin/admin_drawer.dart';

class AdminSettingsScreen extends StatefulWidget {
  const AdminSettingsScreen({super.key});

  @override
  State<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends State<AdminSettingsScreen> {
  final ApiClient _client = ApiClient();
  late TextEditingController _hostCtrl;

  @override
  void initState() {
    super.initState();
    _hostCtrl = TextEditingController(text: _client.baseUrl);
  }

  @override
  void dispose() {
    _hostCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSaveHost() async {
    final host = _hostCtrl.text.trim();
    await _client.setCustomBaseUrl(host.isNotEmpty ? host : null);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Backend URL set to: ${_client.baseUrl}'),
          backgroundColor: AppColors.successDark,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('System Settings', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      drawer: const AdminDrawer(activeRoute: 'settings'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Backend Connectivity Card
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
                  const Text('Backend Host Endpoint', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  const Text(
                    'Customize the Spring Boot API base URL for physical device debugging or custom environments.',
                    style: TextStyle(fontSize: 11.5, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _hostCtrl,
                    decoration: const InputDecoration(
                      hintText: 'http://10.0.2.2:8080 or http://192.168.1.X:8080',
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      ElevatedButton(
                        onPressed: _handleSaveHost,
                        child: const Text('Update Host'),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: () {
                          _hostCtrl.clear();
                          _handleSaveHost();
                        },
                        child: const Text('Reset to Default'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Deal Governance Thresholds
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Deal Governance Rules', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
                  Divider(color: AppColors.border, height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Minimum Deal Discount', style: TextStyle(fontSize: 12)),
                      Text('50% Guaranteed', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: AppColors.danger)),
                    ],
                  ),
                  SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Price Verification Interval', style: TextStyle(fontSize: 12)),
                      Text('Every 60 minutes', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                    ],
                  ),
                  SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Dead Link Policy', style: TextStyle(fontSize: 12)),
                      Text('Auto-deactivate immediately', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
