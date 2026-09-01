import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/category_model.dart';

class CategoryService {
  final ApiClient _client = ApiClient();

  Future<List<CategoryModel>> getCategories() async {
    final response = await _client.get(ApiEndpoints.categories);
    if (response is List) {
      return response
          .map((item) => CategoryModel.fromJson(item as Map<String, dynamic>))
          .where((c) => c.active != false)
          .toList();
    }
    return [];
  }

  Future<CategoryModel> getCategoryById(dynamic id) async {
    final response = await _client.get(ApiEndpoints.categoryById(id));
    return CategoryModel.fromJson(response as Map<String, dynamic>);
  }

  Future<CategoryModel> createCategory(Map<String, dynamic> data) async {
    final response = await _client.post(ApiEndpoints.categories, body: data);
    return CategoryModel.fromJson(response as Map<String, dynamic>);
  }

  Future<CategoryModel> updateCategory(dynamic id, Map<String, dynamic> data) async {
    final response = await _client.put(ApiEndpoints.categoryById(id), body: data);
    return CategoryModel.fromJson(response as Map<String, dynamic>);
  }

  Future<void> deleteCategory(dynamic id) async {
    await _client.delete(ApiEndpoints.categoryById(id));
  }
}
