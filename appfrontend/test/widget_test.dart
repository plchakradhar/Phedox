import 'package:flutter_test/flutter_test.dart';
import 'package:appfrontend/core/utils/currency_formatter.dart';
import 'package:appfrontend/core/utils/date_formatter.dart';
import 'package:appfrontend/models/product_model.dart';
import 'package:appfrontend/models/category_model.dart';

void main() {
  group('Phedox Utilities & Models Tests', () {
    test('CurrencyFormatter formats INR correctly', () {
      expect(CurrencyFormatter.format(1999), contains('1,999'));
      expect(CurrencyFormatter.format('500'), contains('500'));
      expect(CurrencyFormatter.format(null), equals('₹0'));
    });

    test('CurrencyFormatter calculates savings correctly', () {
      final savings = CurrencyFormatter.calculateSavings(5000, 2000);
      expect(savings, equals(3000));
    });

    test('CurrencyFormatter formats percent correctly', () {
      expect(CurrencyFormatter.formatPercent(80.4), equals('80%'));
      expect(CurrencyFormatter.formatPercent('75'), equals('75%'));
    });

    test('ProductModel JSON deserialization works', () {
      final json = {
        'id': 101,
        'name': 'Samsung Galaxy 5G Phone',
        'currentPrice': 9999,
        'originalPrice': 24999,
        'discountPercentage': 60,
        'marketplaceName': 'Flipkart',
        'stockStatus': 'IN_STOCK',
        'status': 'ACTIVE',
      };

      final product = ProductModel.fromJson(json);
      expect(product.id, equals(101));
      expect(product.name, equals('Samsung Galaxy 5G Phone'));
      expect(product.parsedDiscount, equals(60));
      expect(product.isOutOfStock, isFalse);
    });

    test('CategoryModel JSON deserialization works', () {
      final json = {
        'id': 1,
        'name': 'Electronics',
        'description': 'Laptops, TVs, and gadgets',
      };

      final cat = CategoryModel.fromJson(json);
      expect(cat.id, equals(1));
      expect(cat.name, equals('Electronics'));
    });

    test('DateFormatter handles relative dates', () {
      final now = DateTime.now().toIso8601String();
      expect(DateFormatter.formatRelativeTime(now), equals('Just now'));
    });
  });
}
