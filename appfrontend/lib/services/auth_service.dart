import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';

class AuthService {
  final ApiClient _client = ApiClient();

  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await _client.post(
      ApiEndpoints.adminLogin,
      body: {
        'username': username,
        'password': password,
      },
    );

    if (response is Map<String, dynamic>) {
      final token = response['token']?.toString();
      if (token != null && token.isNotEmpty) {
        await _client.setAuthToken(token);
      }
      return response;
    }

    throw ApiException('Invalid response format from login endpoint.');
  }

  Future<void> logout() async {
    await _client.setAuthToken(null);
  }

  bool get isAuthenticated => _client.isAuthenticated;
}
