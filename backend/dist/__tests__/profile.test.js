"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const db_1 = require("../db");
const prisma_1 = __importDefault(require("../config/prisma"));
const securityService_1 = require("../services/securityService");
const recommendationService_1 = require("../services/recommendationService");
const profileValidator_1 = require("../validators/profileValidator");
describe('Fundi Professional Profile System Upgrades', () => {
    afterAll(async () => {
        index_1.server.close();
        await db_1.db.close();
        await prisma_1.default.$disconnect();
    });
    describe('Security Service Tests', () => {
        it('should encrypt and decrypt paths correctly using AES-256-GCM', () => {
            const originalPath = '/uploads/my_certificate_spec.pdf';
            const encrypted = securityService_1.SecurityService.encrypt(originalPath);
            expect(encrypted).toContain(':');
            const decrypted = securityService_1.SecurityService.decrypt(encrypted);
            expect(decrypted).toBe(originalPath);
        });
        it('should fail decryption if data is tampered with', () => {
            const originalPath = '/uploads/my_certificate_spec.pdf';
            const encrypted = securityService_1.SecurityService.encrypt(originalPath);
            const parts = encrypted.split(':');
            parts[2] = parts[2].substring(0, parts[2].length - 4) + 'beef'; // tamper ciphertext
            const tampered = parts.join(':');
            expect(() => securityService_1.SecurityService.decrypt(tampered)).toThrow();
        });
        it('should identify valid PNG headers and detect spoofing', () => {
            const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
            const type = securityService_1.SecurityService.validateMagicBytes(pngBuffer, '.png');
            expect(type).toBe('image/png');
            expect(() => securityService_1.SecurityService.validateMagicBytes(pngBuffer, '.jpg')).toThrow('Extension spoofing detected');
        });
        it('should identify valid PDF headers', () => {
            const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x31, 0x2E, 0x34]);
            const type = securityService_1.SecurityService.validateMagicBytes(pdfBuffer, '.pdf');
            expect(type).toBe('application/pdf');
        });
        it('should reject unrecognized format headers', () => {
            const badBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
            expect(() => securityService_1.SecurityService.validateMagicBytes(badBuffer, '.pdf')).toThrow();
        });
        it('should detect the EICAR test signature and reject buffer as virus', async () => {
            const virusBuffer = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
            const isClean = await securityService_1.SecurityService.scanFileForViruses(virusBuffer);
            expect(isClean).toBe(false);
        });
        it('should identify a clean file as safe', async () => {
            const cleanBuffer = Buffer.from('This is a completely clean, normal certification document file data.');
            const isClean = await securityService_1.SecurityService.scanFileForViruses(cleanBuffer);
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
            const result = profileValidator_1.certificateSchema.safeParse(validCert);
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
            const result = profileValidator_1.certificateSchema.safeParse(invalidCert);
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
            const result = profileValidator_1.profileUpdateSchema.safeParse(validUpdate);
            expect(result.success).toBe(true);
        });
    });
    describe('AI Matching & Recommendation Service Tests', () => {
        it('should correctly calculate Haversine distance between two coordinates', () => {
            // Mikocheni (-6.7823, 39.2612) to Oysterbay (-6.7725, 39.2789)
            const dist = recommendationService_1.RecommendationService.calculateDistance(-6.7823, 39.2612, -6.7725, 39.2789);
            expect(dist).toBeGreaterThan(1.5);
            expect(dist).toBeLessThan(3);
        });
    });
    describe('Upgraded APIs Integration Routing', () => {
        it('should fetch professions successfully', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/api/fundis/professions');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('should return 404 for a non-existent fundi profile', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/api/fundis/profile/non-existent-uuid');
            expect(res.status).toBe(404);
        });
    });
});
