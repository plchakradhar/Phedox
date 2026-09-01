import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../widgets/common/phedox_app_bar.dart';
import '../../widgets/common/category_nav_bar.dart';
import 'home_screen.dart';
import 'deals_screen.dart';
import 'categories_screen.dart';
import 'category_deals_screen.dart';
import 'search_screen.dart';
import 'about_screen.dart';
import 'contact_screen.dart';
import '../admin/admin_login_screen.dart';

class CustomerMainShell extends StatefulWidget {
  final int initialTabIndex;

  const CustomerMainShell({super.key, this.initialTabIndex = 0});

  @override
  State<CustomerMainShell> createState() => _CustomerMainShellState();
}

class _CustomerMainShellState extends State<CustomerMainShell> {
  late int _currentTabIndex;
  String _activeCategoryId = 'for-you';
  String _activeCategoryLabel = 'For You';

  @override
  void initState() {
    super.initState();
    _currentTabIndex = widget.initialTabIndex;
  }

  void _onCategorySelected(String id, String label) {
    setState(() {
      _activeCategoryId = id;
      _activeCategoryLabel = label;

      if (id == 'for-you') {
        _currentTabIndex = 0;
      } else if (id == 'all-deals') {
        _currentTabIndex = 1;
      } else {
        // Open category view right on the SAME screen without pushing new route
        _currentTabIndex = 0;
      }
    });
  }

  Widget _buildHomeOrCategoryTab() {
    if (_activeCategoryId == 'for-you') {
      return HomeScreen(onNavigateCategory: _onCategorySelected);
    }
    return CategoryDealsScreen(
      key: ValueKey('cat-$_activeCategoryId'),
      categoryId: _activeCategoryId,
      categoryName: _activeCategoryLabel,
      showAppBar: false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

    return Scaffold(
      key: scaffoldKey,
      appBar: PhedoxAppBar(
        onMenuPressed: () => scaffoldKey.currentState?.openEndDrawer(),
      ),
      endDrawer: _buildCustomerDrawer(context),
      body: Column(
        children: [
          // Horizontal Category Nav Bar (Always visible below header)
          CategoryNavBar(
            activeCategoryId: _activeCategoryId,
            onCategorySelected: _onCategorySelected,
          ),

          // Active Tab Content on the SAME screen
          Expanded(
            child: IndexedStack(
              index: _currentTabIndex,
              children: [
                _buildHomeOrCategoryTab(),
                const DealsScreen(),
                CategoriesScreen(
                  onSelectCategory: (id, name) =>
                      _onCategorySelected(id.toString(), name),
                ),
                const SearchScreen(),
                const AboutScreen(),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTabIndex,
        onTap: (index) {
          setState(() {
            _currentTabIndex = index;
            if (index == 0) {
              _activeCategoryId = 'for-you';
              _activeCategoryLabel = 'For You';
            } else if (index == 1) {
              _activeCategoryId = 'all-deals';
              _activeCategoryLabel = 'All Deals';
            }
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.home),
            activeIcon: Icon(CupertinoIcons.house_fill),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.bolt),
            activeIcon: Icon(CupertinoIcons.bolt_fill),
            label: 'All Deals',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.square_grid_2x2),
            activeIcon: Icon(CupertinoIcons.square_grid_2x2_fill),
            label: 'Categories',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.search),
            label: 'Search',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.info),
            activeIcon: Icon(CupertinoIcons.info_circle_fill),
            label: 'About',
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.bgSurface,
      child: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  Image.asset(
                    'assets/images/phedox-logo-trans.png',
                    height: 28,
                    errorBuilder: (context, error, stackTrace) => const Text(
                      'PHEDOX',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  ListTile(
                    leading: const Icon(CupertinoIcons.home),
                    title: const Text('Home',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    onTap: () {
                      Navigator.of(context).pop();
                      _onCategorySelected('for-you', 'For You');
                    },
                  ),
                  ListTile(
                    leading: const Icon(CupertinoIcons.bolt_fill,
                        color: AppColors.primary),
                    title: const Text('All Deals (50%+ OFF)',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    onTap: () {
                      Navigator.of(context).pop();
                      _onCategorySelected('all-deals', 'All Deals');
                    },
                  ),
                  ListTile(
                    leading: const Icon(CupertinoIcons.square_grid_2x2),
                    title: const Text('Categories',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    onTap: () {
                      Navigator.of(context).pop();
                      setState(() => _currentTabIndex = 2);
                    },
                  ),
                  ListTile(
                    leading: const Icon(CupertinoIcons.info_circle),
                    title: const Text('About Phedox',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    onTap: () {
                      Navigator.of(context).pop();
                      setState(() => _currentTabIndex = 4);
                    },
                  ),
                  ListTile(
                    leading: const Icon(CupertinoIcons.mail),
                    title: const Text('Contact Support',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(
                            builder: (_) => const ContactScreen()),
                      );
                    },
                  ),
                  const Divider(color: AppColors.border, height: 24),
                  ListTile(
                    leading: const Icon(Icons.admin_panel_settings,
                        color: AppColors.primary),
                    title: const Text(
                      'Admin Control Center',
                      style: TextStyle(
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary),
                    ),
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(
                            builder: (_) => const AdminLoginScreen()),
                      );
                    },
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
