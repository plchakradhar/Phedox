import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiException implements Exception {
  final String message;
  final int statusCode;
  final dynamic data;

  ApiException(this.message, {this.statusCode = 0, this.data});

  @override
  String toString() => message;
}

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  String? _customBaseUrl;
  String? _token;

  static const String _tokenPrefKey = 'phedox_token';
  static const String _customHostPrefKey = 'phedox_custom_host';

  /// Initialize stored token and custom host
  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString(_tokenPrefKey);
      _customBaseUrl = prefs.getString(_customHostPrefKey);
    } catch (e) {
      debugPrint('ApiClient init error: $e');
    }
  }

  /// Get the active base URL based on platform or user override
  String get baseUrl {
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      return _customBaseUrl!.replaceAll(RegExp(r'/+$'), '');
    }

    const envBaseUrl = String.fromEnvironment('API_BASE_URL');
    if (envBaseUrl.isNotEmpty) {
      return envBaseUrl.replaceAll(RegExp(r'/+$'), '');
    }

    if (kIsWeb) {
      return 'http://localhost:8080';
    }

    try {
      if (Platform.isAndroid) {
        // Standard Android emulator loopback to host machine
        return 'http://10.0.2.2:8080';
      }
    } catch (_) {}

    return 'http://127.0.0.1:8080';
  }

  /// Update custom backend URL (for physical device debugging e.g. http://192.168.1.50:8080)
  Future<void> setCustomBaseUrl(String? url) async {
    _customBaseUrl = url?.trim();
    final prefs = await SharedPreferences.getInstance();
    if (_customBaseUrl != null && _customBaseUrl!.isNotEmpty) {
      await prefs.setString(_customHostPrefKey, _customBaseUrl!);
    } else {
      await prefs.remove(_customHostPrefKey);
    }
  }

  /// Set JWT auth token
  Future<void> setAuthToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token != null && token.isNotEmpty) {
      await prefs.setString(_tokenPrefKey, token);
    } else {
      await prefs.remove(_tokenPrefKey);
    }
  }

  String? get token => _token;

  bool get isAuthenticated => _token != null && _token!.isNotEmpty;

  Map<String, String> _buildHeaders({Map<String, String>? extraHeaders}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (_token != null && _token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_token';
    }

    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }

    return headers;
  }

  Uri _buildUri(String endpoint, [Map<String, dynamic>? queryParams]) {
    final base = baseUrl;
    final normalizedEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    final fullUrl = '$base$normalizedEndpoint';

    if (queryParams == null || queryParams.isEmpty) {
      return Uri.parse(fullUrl);
    }

    // Filter out null or empty string params
    final cleanParams = <String, String>{};
    queryParams.forEach((key, value) {
      if (value != null && value.toString().trim().isNotEmpty) {
        cleanParams[key] = value.toString().trim();
      }
    });

    return Uri.parse(fullUrl).replace(queryParameters: cleanParams.isEmpty ? null : cleanParams);
  }

  /// GET Request
  Future<dynamic> get(
    String endpoint, {
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(endpoint, queryParams);
    try {
      final response = await http
          .get(uri, headers: _buildHeaders(extraHeaders: headers))
          .timeout(const Duration(seconds: 15));

      return _handleResponse(response);
    } catch (e) {
      _handleError(e);
    }
  }

  /// POST Request
  Future<dynamic> post(
    String endpoint, {
    dynamic body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(endpoint);
    try {
      final response = await http
          .post(
            uri,
            headers: _buildHeaders(extraHeaders: headers),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 20));

      return _handleResponse(response);
    } catch (e) {
      _handleError(e);
    }
  }

  /// PUT Request
  Future<dynamic> put(
    String endpoint, {
    dynamic body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(endpoint);
    try {
      final response = await http
          .put(
            uri,
            headers: _buildHeaders(extraHeaders: headers),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 20));

      return _handleResponse(response);
    } catch (e) {
      _handleError(e);
    }
  }

  /// DELETE Request
  Future<dynamic> delete(
    String endpoint, {
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(endpoint);
    try {
      final response = await http
          .delete(uri, headers: _buildHeaders(extraHeaders: headers))
          .timeout(const Duration(seconds: 15));

      return _handleResponse(response);
    } catch (e) {
      _handleError(e);
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode == 204) {
      return null;
    }

    if (response.statusCode == 401) {
      setAuthToken(null);
      throw ApiException('Session expired or unauthorized. Please log in.', statusCode: 401);
    }

    dynamic data;
    try {
      final body = utf8.decode(response.bodyBytes);
      if (body.isNotEmpty) {
        data = jsonDecode(body);
      }
    } catch (_) {
      data = response.body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }

    String message = 'Request failed with status ${response.statusCode}';
    if (data is Map) {
      message = data['message'] ?? data['error'] ?? message;
    }

    throw ApiException(message, statusCode: response.statusCode, data: data);
  }

  Never _handleError(dynamic error) {
    if (error is ApiException) {
      throw error;
    }
    throw ApiException(
      'Unable to connect to Phedox server (${error.toString()}). Check if backend is running.',
    );
  }

  /// Helper to resolve relative product image paths like `/uploads/...` to full URLs
  String resolveImageUrl(String? url) {
    if (url == null || url.trim().isEmpty) return '';
    final trimmed = url.trim();
    if (trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return '$baseUrl$trimmed';
    }
    return '$baseUrl/$trimmed';
  }
}
