import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../screens/admin/admin_dashboard_screen.dart';
import '../../screens/admin/admin_products_screen.dart';
import '../../screens/admin/admin_categories_screen.dart';
import '../../screens/admin/admin_marketplaces_screen.dart';
import '../../screens/admin/admin_telegram_screen.dart';
import '../../screens/admin/admin_processing_screen.dart';
import '../../screens/admin/admin_analytics_screen.dart';
import '../../screens/admin/admin_settings_screen.dart';
import '../../screens/customer/customer_main_shell.dart';

class AdminDrawer extends StatelessWidget {
  final String activeRoute;

  const AdminDrawer({super.key, required this.activeRoute});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.bgSurface,
      child: SafeArea(
        child: Column(
          children: [
            // Drawer Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.admin_panel_settings,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Phedox Control Center',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textMain,
                          ),
                        ),
                        Text(
                          'Admin Portal',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Navigation Links
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _buildItem(
                    context,
                    title: 'Dashboard Overview',
                    icon: CupertinoIcons.chart_pie,
                    route: 'dashboard',
                    screen: const AdminDashboardScreen(),
                  ),
                  _buildItem(
                    context,
                    title: 'Products Management',
                    icon: CupertinoIcons.cube_box,
                    route: 'products',
                    screen: const AdminProductsScreen(),
                  ),
                  _buildItem(
                    context,
                    title: 'Deal Categories',
                    icon: CupertinoIcons.square_grid_2x2,
                    route: 'categories',
                    screen: const AdminCategoriesScreen(),
                  ),
                  _buildItem(
                    context,
                    title: 'Marketplaces & Stores',
                    icon: CupertinoIcons.cart,
                    route: 'marketplaces',
                    screen: const AdminMarketplacesScreen(),
                  ),
                  _buildItem(
                    context,
                    title: 'Telegram Deals Ingestion',
                    icon: CupertinoIcons.paperplane,
                    route: 'telegram',
                    screen: const AdminTelegramScreen(),
                  ),
                  _buildItem(
                    context,
                    title: 'Processing Pipeline',
                    icon: CupertinoIcons.gear_alt,
                    route: 'processing',
                    screen: const AdminProcessingScreen(),
                  ),
                  _buildItem(
                    context,
                    title: 'Analytics & Clicks',
                    icon: CupertinoIcons.graph_square,
                    route: 'analytics',
                    screen: const AdminAnalyticsScreen(),
                  ),
                  _buildItem(
                    context,
                    title: 'System Settings',
                    icon: CupertinoIcons.settings,
                    route: 'settings',
                    screen: const AdminSettingsScreen(),
                  ),
                  const Divider(color: AppColors.border, height: 24),
                  ListTile(
                    leading: const Icon(CupertinoIcons.arrow_left_circle, color: AppColors.primary),
                    title: const Text(
                      'Back to Public Store',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                    onTap: () {
                      Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute(builder: (_) => const CustomerMainShell()),
                        (route) => false,
                      );
                    },
                  ),
                ],
              ),
            ),

            // Logout Footer
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: ListTile(
                leading: const Icon(Icons.logout, color: AppColors.danger, size: 20),
                title: const Text(
                  'Log Out',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.danger,
                  ),
                ),
                onTap: () async {
                  await context.read<AuthProvider>().logout();
                  if (context.mounted) {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (_) => const CustomerMainShell()),
                      (route) => false,
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildItem(
    BuildContext context, {
    required String title,
    required IconData icon,
    required String route,
    required Widget screen,
  }) {
    final isActive = activeRoute == route;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: isActive ? AppColors.primaryLight : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          size: 18,
          color: isActive ? AppColors.primary : AppColors.textSecondary,
        ),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
            color: isActive ? AppColors.primary : AppColors.textSecondary,
          ),
        ),
        dense: true,
        onTap: () {
          if (isActive) {
            Navigator.of(context).pop();
            return;
          }
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => screen),
          );
        },
      ),
    );
  }
}
