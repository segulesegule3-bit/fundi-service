import 'package:dio/dio';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/network/dio_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.read(dioProvider);
  final storage = ref.read(secureStorageProvider);
  return AuthRepository(dio, storage);
});

class AuthRepository {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  AuthRepository(this._dio, this._storage);

  /**
   * Log in user using email or phone and password
   */
  Future<bool> login(String identifier, String password) async {
    try {
      final isEmail = identifier.contains('@');
      final data = {
        if (isEmail) 'email': identifier else 'phoneNumber': identifier,
        'password': password,
      };

      final response = await _dio.post('/auth/login', data: data);

      if (response.statusCode == 200 && response.data['success'] == true) {
        final accessToken = response.data['data']['token'];
        final refreshToken = response.data['data']['refreshToken'];

        // Write tokens securely
        await _storage.write(key: 'access_token', value: accessToken);
        await _storage.write(key: 'refresh_token', value: refreshToken);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Register a new Customer profile
   */
  Future<bool> registerCustomer(String fullName, String phoneNumber, String? email, String password) async {
    try {
      final data = {
        'fullName': fullName,
        'phoneNumber': phoneNumber,
        if (email != null && email.isNotEmpty) 'email': email,
        'password': password,
        'confirmPassword': password,
        'acceptTerms': true,
      };

      final response = await _dio.post('/auth/register/customer', data: data);
      return response.statusCode == 201 && response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Verify registration OTP code
   */
  Future<bool> verifyOTP(String phoneNumber, String code) async {
    try {
      final response = await _dio.post('/auth/verify-otp', data: {
        'phoneNumber': phoneNumber,
        'code': code,
        'purpose': 'registration',
      });
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Clear session tokens upon logout
   */
  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (_) {}
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
  }

  /**
   * Check if user is currently authenticated
   */
  Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: 'access_token');
    return token != null;
  }
}
