import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class RecentSearchesProvider extends ChangeNotifier {
  static const String _key = 'recentSearches';
  List<String> _recentSearches = [];

  List<String> get recentSearches => _recentSearches;

  Future<void> loadRecentSearches() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final stored = prefs.getString(_key);
      if (stored != null && stored.isNotEmpty) {
        final decoded = jsonDecode(stored);
        if (decoded is List) {
          _recentSearches = decoded.map((e) => e.toString()).toList();
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error loading recent searches: $e');
    }
  }

  Future<void> addSearch(String query) async {
    final clean = query.trim();
    if (clean.isEmpty) return;

    _recentSearches.removeWhere((q) => q.toLowerCase() == clean.toLowerCase());
    _recentSearches.insert(0, clean);

    if (_recentSearches.length > 10) {
      _recentSearches = _recentSearches.sublist(0, 10);
    }

    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_key, jsonEncode(_recentSearches));
    } catch (e) {
      debugPrint('Error saving recent searches: $e');
    }
  }

  Future<void> removeSearch(String query) async {
    _recentSearches.removeWhere((q) => q.toLowerCase() == query.toLowerCase());
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_key, jsonEncode(_recentSearches));
    } catch (e) {
      debugPrint('Error removing recent search: $e');
    }
  }

  Future<void> clearAll() async {
    _recentSearches.clear();
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_key);
    } catch (e) {
      debugPrint('Error clearing recent searches: $e');
    }
  }
}
