"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const db_1 = require("../db");
const prisma_1 = __importDefault(require("../config/prisma"));
describe('App Versioning and Secure Download APIs', () => {
    afterAll(async () => {
        index_1.server.close();
        await db_1.db.close();
        await prisma_1.default.$disconnect();
    });
    describe('GET /api/version', () => {
        it('should return all latest releases when no appType is provided', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/api/version');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        });
        it('should return specific release details when appType=customer', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/api/version?appType=customer');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.appType).toBe('customer');
            expect(res.body.data).toHaveProperty('version');
            expect(res.body.data).toHaveProperty('downloadUrl');
        });
        it('should return specific release details when appType=fundi', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/api/version?appType=fundi');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.appType).toBe('fundi');
            expect(res.body.data).toHaveProperty('version');
        });
        it('should return 400 Bad Request if invalid appType is queried', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/api/version?appType=invalid');
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
    describe('GET /download/:appType', () => {
        it('should download customer APK file with correct headers', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/download/customer');
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toBe('application/vnd.android.package-archive');
            expect(res.header['content-disposition']).toContain('attachment');
            expect(res.text).toBe('MOCK_CUSTOMER_APK_BINARY_CONTENT');
        });
        it('should download fundi APK file with correct headers', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/download/fundi');
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toBe('application/vnd.android.package-archive');
            expect(res.header['content-disposition']).toContain('attachment');
            expect(res.text).toBe('MOCK_FUNDI_APK_BINARY_CONTENT');
        });
        it('should return 400 Bad Request for an unsupported appType parameter', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/download/invalidType');
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
        it('should support direct APK request for customer app mapping (/app-1.0.0.apk)', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/app-1.0.0.apk');
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toBe('application/vnd.android.package-archive');
            expect(res.text).toBe('MOCK_CUSTOMER_APK_BINARY_CONTENT');
        });
        it('should support direct APK request for fundi app mapping (/fundi-v1.0.0.apk)', async () => {
            const res = await (0, supertest_1.default)(index_1.app).get('/fundi-v1.0.0.apk');
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toBe('application/vnd.android.package-archive');
            expect(res.text).toBe('MOCK_FUNDI_APK_BINARY_CONTENT');
        });
    });
});
