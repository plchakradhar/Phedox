import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String? status;

  const StatusBadge({super.key, this.status});

  @override
  Widget build(BuildContext context) {
    final s = (status ?? 'ACTIVE').toUpperCase();

    Color bgColor = AppColors.successLight;
    Color textColor = AppColors.successDark;
    String label = s;

    switch (s) {
      case 'ACTIVE':
      case 'PROCESSED':
      case 'SUCCESS':
        bgColor = const Color(0xFFECFDF5);
        textColor = const Color(0xFF059669);
        label = s == 'ACTIVE' ? 'Active' : (s == 'PROCESSED' ? 'Processed' : 'Success');
        break;
      case 'INACTIVE':
      case 'FAILED':
        bgColor = const Color(0xFFFEF2F2);
        textColor = const Color(0xFFDC2626);
        label = s == 'INACTIVE' ? 'Inactive' : 'Failed';
        break;
      case 'PROCESSING':
        bgColor = const Color(0xFFEFF6FF);
        textColor = const Color(0xFF2563EB);
        label = 'Processing';
        break;
      case 'RECEIVED':
      case 'PENDING':
        bgColor = const Color(0xFFFFFBEB);
        textColor = const Color(0xFFD97706);
        label = s == 'RECEIVED' ? 'Received' : 'Pending';
        break;
      default:
        bgColor = AppColors.bgSubtle;
        textColor = AppColors.textMuted;
        label = s;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
