import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/product_model.dart';

class ProductService {
  final ApiClient _client = ApiClient();

  /// Get public active products with optional filters
  Future<List<ProductModel>> getProducts({
    dynamic categoryId,
    dynamic marketplaceId,
    dynamic minDiscount,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{};
    if (categoryId != null && categoryId.toString().trim().isNotEmpty) {
      final str = categoryId.toString().trim();
      final numId = int.tryParse(str);
      if (numId != null) {
        queryParams['categoryId'] = numId.toString();
      } else if (search == null || search.trim().isEmpty) {
        // String category slug like 'fashion' or 'electronics', pass as search
        queryParams['search'] = str;
      }
    }
    if (marketplaceId != null && marketplaceId.toString().trim().isNotEmpty) {
      final str = marketplaceId.toString().trim();
      final numId = int.tryParse(str);
      if (numId != null) {
        queryParams['marketplaceId'] = numId.toString();
      }
    }
    if (minDiscount != null && minDiscount.toString().trim().isNotEmpty) {
      queryParams['minDiscount'] = minDiscount.toString().trim();
    }
    if (search != null && search.trim().isNotEmpty) {
      queryParams['search'] = search.trim();
    }

    final response = await _client.get(
      ApiEndpoints.products,
      queryParams: queryParams,
    );

    if (response is List) {
      return response
          .map((item) => ProductModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  /// Get single product by ID
  Future<ProductModel> getProductById(dynamic id) async {
    final response = await _client.get(ApiEndpoints.productById(id));
    if (response is Map<String, dynamic>) {
      return ProductModel.fromJson(response);
    }
    throw ApiException('Invalid product details format.');
  }

  /// Admin: Get all products
  Future<List<ProductModel>> getAllAdminProducts() async {
    final response = await _client.get(ApiEndpoints.adminProducts);
    if (response is List) {
      return response
          .map((item) => ProductModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  /// Admin: Create product manually
  Future<ProductModel> createProduct(Map<String, dynamic> productData) async {
    final response = await _client.post(ApiEndpoints.products, body: productData);
    return ProductModel.fromJson(response as Map<String, dynamic>);
  }

  /// Admin: Update product
  Future<ProductModel> updateProduct(dynamic id, Map<String, dynamic> productData) async {
    final response = await _client.put(ApiEndpoints.productById(id), body: productData);
    return ProductModel.fromJson(response as Map<String, dynamic>);
  }

  /// Admin: Deactivate product
  Future<void> deactivateProduct(dynamic id) async {
    await _client.delete(ApiEndpoints.productById(id));
  }
}
