import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../screens/customer/search_screen.dart';

class PhedoxAppBar extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback? onMenuPressed;
  final bool showSearchBar;

  const PhedoxAppBar({
    super.key,
    this.onMenuPressed,
    this.showSearchBar = true,
  });

  @override
  Size get preferredSize => const Size.fromHeight(60);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.bgSurface,
      elevation: 0,
      titleSpacing: 12,
      automaticallyImplyLeading: false,
      title: Row(
        children: [
          // Phedox Brand Logo Image
          Image.asset(
            'assets/images/phedox-logo-trans.png',
            height: 32,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) => const Text(
              'PHEDOX',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
                fontSize: 18,
                letterSpacing: 1,
              ),
            ),
          ),
          const SizedBox(width: 10),

          // Search Bar
          if (showSearchBar)
            Expanded(
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const SearchScreen()),
                  );
                },
                child: Container(
                  height: 38,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: AppColors.bgSubtle,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Row(
                    children: [
                      Icon(
                        CupertinoIcons.search,
                        size: 16,
                        color: AppColors.textMuted,
                      ),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Search deals, brands...',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
      actions: [
        if (onMenuPressed != null)
          IconButton(
            icon: const Icon(Icons.menu, color: AppColors.textMain, size: 24),
            onPressed: onMenuPressed,
          ),
      ],
    );
  }
}
