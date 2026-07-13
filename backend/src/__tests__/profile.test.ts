import request from 'supertest';
import { app, server } from '../index';
import { db } from '../db';
import prisma from '../config/prisma';
import { SecurityService } from '../services/securityService';
import { RecommendationService } from '../services/recommendationService';
import { certificateSchema, profileUpdateSchema } from '../validators/profileValidator';

describe('Fundi Professional Profile System Upgrades', () => {
  afterAll(async () => {
    server.close();
    await db.close();
    await prisma.$disconnect();
  });

  describe('Security Service Tests', () => {
    it('should encrypt and decrypt paths correctly using AES-256-GCM', () => {
      const originalPath = '/uploads/my_certificate_spec.pdf';
      const encrypted = SecurityService.encrypt(originalPath);
      
      expect(encrypted).toContain(':');
      const decrypted = SecurityService.decrypt(encrypted);
      expect(decrypted).toBe(originalPath);
    });

    it('should fail decryption if data is tampered with', () => {
      const originalPath = '/uploads/my_certificate_spec.pdf';
      const encrypted = SecurityService.encrypt(originalPath);
      const parts = encrypted.split(':');
      parts[2] = parts[2].substring(0, parts[2].length - 4) + 'beef'; // tamper ciphertext
      const tampered = parts.join(':');
      
      expect(() => SecurityService.decrypt(tampered)).toThrow();
    });

    it('should identify valid PNG headers and detect spoofing', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      
      const type = SecurityService.validateMagicBytes(pngBuffer, '.png');
      expect(type).toBe('image/png');

      expect(() => SecurityService.validateMagicBytes(pngBuffer, '.jpg')).toThrow('Extension spoofing detected');
    });

    it('should identify valid PDF headers', () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x31, 0x2E, 0x34]);
      const type = SecurityService.validateMagicBytes(pdfBuffer, '.pdf');
      expect(type).toBe('application/pdf');
    });

    it('should reject unrecognized format headers', () => {
      const badBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      expect(() => SecurityService.validateMagicBytes(badBuffer, '.pdf')).toThrow();
    });

    it('should detect the EICAR test signature and reject buffer as virus', async () => {
      const virusBuffer = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
      const isClean = await SecurityService.scanFileForViruses(virusBuffer);
      expect(isClean).toBe(false);
    });

    it('should identify a clean file as safe', async () => {
      const cleanBuffer = Buffer.from('This is a completely clean, normal certification document file data.');
      const isClean = await SecurityService.scanFileForViruses(cleanBuffer);
      expect(isClean).toBe(true);
    });
  });

  describe('Zod Schema Validation Tests', () => {
    it('should validate correct certificate information successfully', () => {
      const validCert = {
        name: 'VETA Electrical Level III',
        institution: 'VETA Kipawa',
        certificateNumber: 'VETA-2022-8877',
        issueDate: '2022-06-15',
        expiryDate: '2027-06-15'
      };

      const result = certificateSchema.safeParse(validCert);
      expect(result.success).toBe(true);
    });

    it('should fail certificate validation if expiry date is before issue date', () => {
      const invalidCert = {
        name: 'VETA Electrical Level III',
        institution: 'VETA Kipawa',
        certificateNumber: 'VETA-2022-8877',
        issueDate: '2022-06-15',
        expiryDate: '2020-06-15'
      };

      const result = certificateSchema.safeParse(invalidCert);
      expect(result.success).toBe(false);
    });

    it('should validate full profile setup parameters', () => {
      const validUpdate = {
        bio: 'Mtaalamu mwenye uzoefu katika ufungaji wa mifumo ya umeme na ukarabati.',
        experienceYears: 6,
        startingPrice: 18000,
        languagesSpoken: ['Swahili', 'English'],
        serviceAreaType: 'RADIUS',
        serviceAreaRadius: 20,
        emergencyServiceEnabled: true,
        workingHoursStart: '08:00',
        workingHoursEnd: '17:00',
        lunchBreakStart: '12:30',
        lunchBreakEnd: '13:30',
        workingDays: [1, 2, 3, 4, 5]
      };

      const result = profileUpdateSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe('AI Matching & Recommendation Service Tests', () => {
    it('should correctly calculate Haversine distance between two coordinates', () => {
      // Mikocheni (-6.7823, 39.2612) to Oysterbay (-6.7725, 39.2789)
      const dist = (RecommendationService as any).calculateDistance(-6.7823, 39.2612, -6.7725, 39.2789);
      expect(dist).toBeGreaterThan(1.5);
      expect(dist).toBeLessThan(3);
    });
  });

  describe('Upgraded APIs Integration Routing', () => {
    it('should fetch professions successfully', async () => {
      const res = await request(app).get('/api/fundis/professions');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 404 for a non-existent fundi profile', async () => {
      const res = await request(app).get('/api/fundis/profile/non-existent-uuid');
      expect(res.status).toBe(404);
    });
  });
});
