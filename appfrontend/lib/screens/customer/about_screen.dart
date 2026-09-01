import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../admin/admin_login_screen.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('About Phedox', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.asset(
                    'assets/images/phedox-logo-trans.png',
                    height: 36,
                    errorBuilder: (context, error, stackTrace) => const Text(
                      'PHEDOX',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 22,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Hunt Less. Save More.',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: AppColors.goldAccent,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Phedox is an intelligent deal aggregation and affiliate tracking platform that automatically monitors, verifies, and surfaces live deals with minimum 50% discount across India\'s largest ecommerce marketplaces.',
                    style: TextStyle(
                      fontSize: 12.5,
                      color: Colors.white70,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Features Grid
            const Text(
              'Why Choose Phedox?',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: AppColors.textMain,
              ),
            ),
            const SizedBox(height: 12),
            _buildFeatureCard(
              CupertinoIcons.percent,
              'Guaranteed 50%+ Discounts',
              'We strictly filter out fake or minor markdowns. Every product listed has a verified discount of 50% or higher.',
            ),
            const SizedBox(height: 10),
            _buildFeatureCard(
              CupertinoIcons.bolt_fill,
              'Real-Time Deal Ingestion',
              'Powered by Telegram bot scrapers and automated price check schedulers running 24/7.',
            ),
            const SizedBox(height: 10),
            _buildFeatureCard(
              CupertinoIcons.shield_lefthalf_fill,
              'Official Merchant Links',
              'Direct redirect to verified marketplace product pages with official affiliate partner integrations.',
            ),
            const SizedBox(height: 24),

            // Admin Portal Access Link
            Center(
              child: OutlinedButton.icon(
                icon: const Icon(Icons.admin_panel_settings, size: 16, color: AppColors.primary),
                label: const Text('Admin Portal Login', style: TextStyle(color: AppColors.primary)),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const AdminLoginScreen()),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCard(IconData icon, String title, String desc) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textMain,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppColors.textSecondary,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
