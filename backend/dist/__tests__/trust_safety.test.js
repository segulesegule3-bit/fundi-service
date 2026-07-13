"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trustSafetyService_1 = require("../services/trustSafetyService");
const db_1 = require("../db");
// Mock the db query
jest.mock('../db', () => ({
    db: {
        query: jest.fn()
    }
}));
describe('Trust, Safety & Warranty Integrations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Trust Score Calculation Calculations', () => {
        it('should correctly calculate trust score with active badges and jobs', async () => {
            // Mock profile response
            db_1.db.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                        id: 'fundi-profile-123',
                        verified_badge: true,
                        completed_jobs: 10,
                        avg_rating: '4.80'
                    }]
            });
            // Mock certificate response (VETA certified)
            db_1.db.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ count: '1' }]
            });
            // Mock claims response
            db_1.db.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ count: '0' }]
            });
            // Recalculate
            const score = await trustSafetyService_1.TrustSafetyService.recalculateTrustScore('fundi-profile-123');
            // Base: 70
            // Verified Identity (verified_badge): +10 => 80
            // Verified Certificate: +10 => 90
            // Jobs completed modifier: 10 * 2 = 20, capped at +10 => 100
            // Rating modifier: 4.80 * 2 = 10 => 110, capped at 100
            expect(score).toEqual(100);
            expect(db_1.db.query).toHaveBeenCalledTimes(5); // SELECT profile, SELECT certs, SELECT claims, INSERT score, INSERT level
        });
        it('should deduct points for accepted warranty claims', async () => {
            // Mock profile response
            db_1.db.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                        id: 'fundi-profile-456',
                        verified_badge: false,
                        completed_jobs: 2,
                        avg_rating: '4.00'
                    }]
            });
            // Mock certificate response (none)
            db_1.db.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ count: '0' }]
            });
            // Mock claims response (2 accepted claims)
            db_1.db.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ count: '2' }]
            });
            // Recalculate
            const score = await trustSafetyService_1.TrustSafetyService.recalculateTrustScore('fundi-profile-456');
            // Base: 70
            // Verified Identity: +0 => 70
            // Verified Certificate: +0 => 70
            // Jobs modifier: 2 * 2 = +4 => 74
            // Rating modifier: 4 * 2 = +8 => 82
            // Claim deductions: 2 claims * -5 = -10 => 72
            expect(score).toEqual(72);
        });
    });
    describe('Duration Parsing Rules', () => {
        it('should map warranty durations to days correctly', () => {
            const getWarrantyDays = (period) => {
                switch (period.toLowerCase()) {
                    case '7 days': return 7;
                    case '14 days': return 14;
                    case '30 days': return 30;
                    case '60 days': return 60;
                    case '90 days': return 90;
                    case '6 months': return 180;
                    case '1 year': return 365;
                    default: return 0;
                }
            };
            expect(getWarrantyDays('7 Days')).toBe(7);
            expect(getWarrantyDays('14 Days')).toBe(14);
            expect(getWarrantyDays('30 days')).toBe(30);
            expect(getWarrantyDays('6 Months')).toBe(180);
            expect(getWarrantyDays('1 Year')).toBe(365);
            expect(getWarrantyDays('No Warranty')).toBe(0);
        });
    });
});
