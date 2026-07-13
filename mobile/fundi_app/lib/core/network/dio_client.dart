import 'package:dio/dio';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:5000/api/v1',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  final storage = ref.read(secureStorageProvider);

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshToken = await storage.read(key: 'refresh_token');
          if (refreshToken != null) {
            try {
              final refreshDio = Dio();
              final response = await refreshDio.post(
                'http://localhost:5000/api/v1/auth/refresh-token',
                data: {'refreshToken': refreshToken},
              );

              if (response.statusCode == 200) {
                final newAccessToken = response.data['data']['token'];
                final newRefreshToken = response.data['data']['refreshToken'];

                await storage.write(key: 'access_token', value: newAccessToken);
                await storage.write(key: 'refresh_token', value: newRefreshToken);

                final options = error.requestOptions;
                options.headers['Authorization'] = 'Bearer $newAccessToken';
                
                final clonedRequest = await dio.request(
                  options.path,
                  options: Options(
                    method: options.method,
                    headers: options.headers,
                  ),
                  data: options.data,
                  queryParameters: options.queryParameters,
                );

                return handler.resolve(clonedRequest);
              }
            } catch (err) {
              await storage.delete(key: 'access_token');
              await storage.delete(key: 'refresh_token');
            }
          }
        }
        return handler.next(error);
      },
    ),
  );

  return dio;
});
