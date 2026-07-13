import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'core/theme/theme.dart';
import 'features/authentication/presentation/login_screen.dart';
import 'features/home/presentation/home_screen.dart';
import 'features/booking/presentation/booking_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize local caching database
  await Hive.initFlutter();
  await Hive.openBox('settings');

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

// Router configuration
final GoRouter _router = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/booking',
      builder: (context, state) => const BookingScreen(),
    ),
  ],
);

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Fundi Service Tanzania',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system, // Dark / Light Mode auto-detection
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      routerConfig: _router,
    );
  }
}
