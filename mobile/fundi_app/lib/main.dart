import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'core/theme/theme.dart';
import 'features/dashboard/presentation/dashboard_screen.dart';
import 'features/jobs/presentation/job_tracking_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive
  await Hive.initFlutter();
  await Hive.openBox('fundi_settings');

  runApp(
    const ProviderScope(
      child: FundiApp(),
    ),
  );
}

// Router configuration
final GoRouter _router = GoRouter(
  initialLocation: '/dashboard',
  routes: [
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/job-tracking/:bookingId',
      builder: (context, state) {
        final bookingId = state.pathParameters['bookingId']!;
        return JobTrackingScreen(bookingId: bookingId);
      },
    ),
  ],
);

class FundiApp extends ConsumerWidget {
  const FundiApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Fundi Mobile App',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      routerConfig: _router,
    );
  }
}
