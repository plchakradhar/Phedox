import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/marketplace_model.dart';

class MarketplaceService {
  final ApiClient _client = ApiClient();

  Future<List<MarketplaceModel>> getMarketplaces() async {
    final response = await _client.get(ApiEndpoints.marketplaces);
    if (response is List) {
      return response
          .map((item) => MarketplaceModel.fromJson(item as Map<String, dynamic>))
          .where((m) => m.active != false)
          .toList();
    }
    return [];
  }

  Future<MarketplaceModel> getMarketplaceById(dynamic id) async {
    final response = await _client.get(ApiEndpoints.marketplaceById(id));
    return MarketplaceModel.fromJson(response as Map<String, dynamic>);
  }

  Future<MarketplaceModel> createMarketplace(Map<String, dynamic> data) async {
    final response = await _client.post(ApiEndpoints.marketplaces, body: data);
    return MarketplaceModel.fromJson(response as Map<String, dynamic>);
  }

  Future<MarketplaceModel> updateMarketplace(dynamic id, Map<String, dynamic> data) async {
    final response = await _client.put(ApiEndpoints.marketplaceById(id), body: data);
    return MarketplaceModel.fromJson(response as Map<String, dynamic>);
  }

  Future<void> deleteMarketplace(dynamic id) async {
    await _client.delete(ApiEndpoints.marketplaceById(id));
  }
}
