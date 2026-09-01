import 'package:flutter/material.dart';

/// Phedox Global Design Tokens & Theme Colors
/// Exactly mirrors variables.css from web frontend
class AppColors {
  // ── 1. Brand Primary (Crimson Deal Red) ──
  static const Color primary = Color(0xFFD90000);
  static const Color primaryHover = Color(0xFFB80000);
  static const Color primaryDark = Color(0xFF8C0000);
  static const Color primaryLight = Color(0xFFFFF1F1);
  static const Color primarySubtle = Color(0xFFFEE5E5);
  static const Color primaryGlow = Color(0x38D90000);

  // ── 2. Secondary & Warm Accent (Pale Gold / Cream) ──
  static const Color goldAccent = Color(0xFFFFEA93);
  static const Color goldAccentHover = Color(0xFFFCE270);
  static const Color goldAccentDark = Color(0xFF805D00);
  static const Color goldAccentLight = Color(0xFFFFFDF5);
  static const Color goldAccentBorder = Color(0xFFF5DF82);
  static const Color goldAccentGlow = Color(0x73FFEA93);

  static const Color accent = goldAccent;
  static const Color accentHover = goldAccentHover;
  static const Color accentLight = goldAccentLight;

  // ── 3. Success & Discount Green (Olive-Sage Green) ──
  static const Color success = Color(0xFF8DB355);
  static const Color successHover = Color(0xFF7BA046);
  static const Color successDark = Color(0xFF587431);
  static const Color successLight = Color(0xFFF2F7EC);
  static const Color successBorder = Color(0x598DB355);

  // ── 4. Utility Status Colors ──
  static const Color warning = Color(0xFFEAB308);
  static const Color warningLight = Color(0xFFFEFCE8);
  static const Color danger = Color(0xFFD90000);
  static const Color dangerLight = Color(0xFFFFF1F1);
  static const Color info = Color(0xFF0284C7);
  static const Color infoLight = Color(0xFFF0F9FF);

  // ── 5. Deep Neutrals & Black ──
  static const Color black = Color(0xFF000000);
  static const Color blackSurface = Color(0xFF111111);
  static const Color blackCard = Color(0xFF181818);
  static const Color blackBorder = Color(0xFF262626);

  static const Color bgMain = Color(0xFFF7F8FA);
  static const Color bgCard = Color(0xFFFFFFFF);
  static const Color bgCardHover = Color(0xFFFAFAFA);
  static const Color bgSurface = Color(0xFFFFFFFF);
  static const Color bgSubtle = Color(0xFFF1F3F6);
  static const Color bgMuted = Color(0xFFE5E7EB);

  static const Color textMain = Color(0xFF000000);
  static const Color textSecondary = Color(0xFF2D2D2D);
  static const Color textMuted = Color(0xFF666666);
  static const Color textSubtle = Color(0xFF999999);
  static const Color textInverse = Color(0xFFFFFFFF);

  static const Color border = Color(0xFFE2E4E8);
  static const Color borderFocus = Color(0xFFD90000);

  // ── 6. Store / Marketplace Brand Colors ──
  static const Color storeAmazon = Color(0xFFFF9900);
  static const Color storeFlipkart = Color(0xFF2874F0);
  static const Color storeMyntra = Color(0xFFFF3F6C);
  static const Color storeAjio = Color(0xFF2C4152);
  static const Color storeNykaa = Color(0xFFFC2779);
  static const Color storeTataCliq = Color(0xFF212121);
  static const Color storeJioMart = Color(0xFF008ECC);
  static const Color storeCroma = Color(0xFF00E9BF);
  static const Color storeMeesho = Color(0xFF8B2188);
  static const Color storeShopsy = Color(0xFF632B94);
  static const Color storeSnapdeal = Color(0xFFE40046);

  static Color getMarketplaceColor(String? marketplaceName) {
    if (marketplaceName == null) return const Color(0xFF6B7280);
    final m = marketplaceName.toLowerCase();
    if (m.contains('amazon')) return storeAmazon;
    if (m.contains('flipkart')) return storeFlipkart;
    if (m.contains('myntra')) return storeMyntra;
    if (m.contains('ajio')) return storeAjio;
    if (m.contains('nykaa')) return storeNykaa;
    if (m.contains('tatacliq') || m.contains('tata cliq')) return storeTataCliq;
    if (m.contains('jiomart') || m.contains('jio mart')) return storeJioMart;
    if (m.contains('croma')) return storeCroma;
    if (m.contains('meesho')) return storeMeesho;
    if (m.contains('shopsy')) return storeShopsy;
    if (m.contains('snapdeal')) return storeSnapdeal;
    return const Color(0xFF6B7280);
  }
}
