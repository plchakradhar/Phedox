import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final NumberFormat _inrFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  /// Format an amount into Indian Rupee format, e.g. 1999 -> ₹1,999
  static String format(dynamic amount) {
    if (amount == null) return '₹0';
    try {
      final num val = num.parse(amount.toString());
      return _inrFormat.format(val);
    } catch (_) {
      return '₹$amount';
    }
  }

  /// Format discount percentage e.g. 80.5 -> 81%
  static String formatPercent(dynamic percent) {
    if (percent == null) return '0%';
    try {
      final num val = num.parse(percent.toString());
      return '${val.round()}%';
    } catch (_) {
      return '$percent%';
    }
  }

  /// Calculate savings amount between original and current price
  static num calculateSavings(dynamic original, dynamic current) {
    if (original == null || current == null) return 0;
    try {
      final num orig = num.parse(original.toString());
      final num curr = num.parse(current.toString());
      return orig > curr ? orig - curr : 0;
    } catch (_) {
      return 0;
    }
  }
}
