import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_constants.dart';
import 'core/network/api_client.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/deals_filter_provider.dart';
import 'providers/recent_searches_provider.dart';
import 'screens/customer/customer_main_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set status bar colors
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize Network Client with persisted tokens / custom host
  await ApiClient().init();

  runApp(const PhedoxApp());
}

class PhedoxApp extends StatelessWidget {
  const PhedoxApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DealsFilterProvider()),
        ChangeNotifierProvider(
          create: (_) => RecentSearchesProvider()..loadRecentSearches(),
        ),
      ],
      child: MaterialApp(
        title: AppConstants.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const CustomerMainShell(),
      ),
    );
  }
}
