import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';

class ClickService {
  static final ApiClient _client = ApiClient();

  /// Returns the backend redirect URL for a product
  static String getRedirectUrl(dynamic productId) {
    final base = _client.baseUrl;
    return '$base${ApiEndpoints.clickRedirect(productId)}';
  }

  /// Triggers affiliate redirect in external browser / webview
  static Future<bool> buyNow(dynamic productId, {String? fallbackUrl}) async {
    if (productId == null) return false;

    final redirectUrl = getRedirectUrl(productId);
    final uri = Uri.parse(redirectUrl);

    try {
      final canLaunch = await canLaunchUrl(uri);
      if (canLaunch) {
        return await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );
      } else if (fallbackUrl != null && fallbackUrl.isNotEmpty) {
        final fallbackUri = Uri.parse(fallbackUrl);
        return await launchUrl(
          fallbackUri,
          mode: LaunchMode.externalApplication,
        );
      }
    } catch (e) {
      debugPrint('Error launching URL: $e');
    }

    return false;
  }
}
