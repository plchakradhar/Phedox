import 'package:intl/intl.dart';

class DateFormatter {
  static final DateFormat _displayFormat = DateFormat('dd MMM yyyy, hh:mm a');

  static String formatDate(dynamic dateString) {
    if (dateString == null) return 'N/A';
    try {
      final DateTime dt = DateTime.parse(dateString.toString());
      return _displayFormat.format(dt);
    } catch (_) {
      return dateString.toString();
    }
  }

  static String formatRelativeTime(dynamic dateString) {
    if (dateString == null) return 'N/A';
    try {
      final DateTime dt = DateTime.parse(dateString.toString());
      final Duration diff = DateTime.now().difference(dt);

      if (diff.inSeconds < 60) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays < 7) return '${diff.inDays}d ago';
      return formatDate(dateString);
    } catch (_) {
      return dateString.toString();
    }
  }
}
