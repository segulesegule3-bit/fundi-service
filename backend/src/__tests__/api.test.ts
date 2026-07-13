import request from 'supertest';
import { app, server } from '../index';
import { db } from '../db';

describe('Fundi Service Tanzania API Security & Auth Tests', () => {
  afterAll(async () => {
    server.close();
    await db.close();
  });

  describe('GET /health', () => {
    it('should return 200 OK and healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
    });
  });

  describe('POST /api/auth/login lockout & token rotation', () => {
    it('should fail authentication and increment login attempts', async () => {
      // Perform failed login attempts
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phoneNumber: '+255755667788', // Juma Shabaan
          password: 'wrong_password_attempt'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Attempts remaining');
    });

    it('should reject refresh token requests with invalid refresh tokens', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid_mock_refresh_token_12345'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/admin/audit-logs authentication', () => {
    it('should deny access to administrative audit-logs without valid token', async () => {
      const response = await request(app).get('/api/admin/audit-logs');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/app/version & download tracking', () => {
    it('should fetch latest app releases version object info', async () => {
      const response = await request(app).get('/api/app/version');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('apk');
      expect(response.body).toHaveProperty('aab');
      expect(response.body).toHaveProperty('ios');
    });

    it('should fetch latest apk info on GET /api/app/latest', async () => {
      const response = await request(app).get('/api/app/latest');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('latestVersion');
      expect(response.body).toHaveProperty('apkUrl');
      expect(response.body).toHaveProperty('releaseNotes');
      expect(response.body).toHaveProperty('minVersion');
      expect(response.body).toHaveProperty('forceUpdate');
    });

    it('should block non-admins from fetching release histories lists', async () => {
      const response = await request(app).get('/api/admin/app/releases');
      expect(response.status).toBe(401);
    });
  });
});
