import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/telegram_post_model.dart';
import '../models/analytics_model.dart';

class TelegramService {
  final ApiClient _client = ApiClient();

  Future<List<TelegramPostModel>> getAllPosts() async {
    final response = await _client.get(ApiEndpoints.telegramPosts);
    if (response is List) {
      return response
          .map((item) => TelegramPostModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  Future<TelegramPostModel> getPostById(dynamic id) async {
    final response = await _client.get(ApiEndpoints.telegramPostById(id));
    return TelegramPostModel.fromJson(response as Map<String, dynamic>);
  }

  Future<List<TelegramPostModel>> getPostsByStatus(String status) async {
    if (status.isEmpty || status == 'ALL') {
      return getAllPosts();
    }
    final response = await _client.get(ApiEndpoints.telegramPostsByStatus(status));
    if (response is List) {
      return response
          .map((item) => TelegramPostModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  Future<TelegramPostModel> receivePost(Map<String, dynamic> data) async {
    final response = await _client.post(ApiEndpoints.telegramPosts, body: data);
    return TelegramPostModel.fromJson(response as Map<String, dynamic>);
  }

  Future<dynamic> processPostManually(dynamic id) async {
    return await _client.post(ApiEndpoints.adminProcessTelegram(id), body: {});
  }

  Future<DashboardAnalyticsModel> getDashboardAnalytics() async {
    final response = await _client.get(ApiEndpoints.dashboardAnalytics);
    if (response is Map<String, dynamic>) {
      return DashboardAnalyticsModel.fromJson(response);
    }
    return DashboardAnalyticsModel();
  }
}
