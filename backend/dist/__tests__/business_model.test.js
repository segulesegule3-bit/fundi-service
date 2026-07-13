"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aiService_1 = require("../services/aiService");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
describe('Upgraded Business Model & Corporate Accounts Unit Tests', () => {
    describe('AI Recommendation Layer Updates', () => {
        it('should correctly recommend fair market prices for electrical work', () => {
            const recommendation = aiService_1.AIService.getFairMarketPrice('electrical');
            expect(recommendation).toBeDefined();
            expect(recommendation.fairPrice).toEqual(45000);
            expect(recommendation.currency).toEqual('TZS');
        });
        it('should correctly recommend fair market prices for plumbing work', () => {
            const recommendation = aiService_1.AIService.getFairMarketPrice('plumbing');
            expect(recommendation.fairPrice).toEqual(30000);
        });
        it('should return default price recommendation for unknown categories', () => {
            const recommendation = aiService_1.AIService.getFairMarketPrice('unknown-category');
            expect(recommendation.fairPrice).toEqual(25000);
        });
        it('should return a valid list of popular services', () => {
            const popular = aiService_1.AIService.getPopularServices();
            expect(popular).toContain('Laptop Repair');
            expect(popular).toContain('AC Maintenance');
            expect(popular.length).toBeGreaterThan(2);
        });
        it('should return valid high-demand locations with demand levels', () => {
            const locations = aiService_1.AIService.getHighDemandLocations();
            expect(locations.length).toBeGreaterThan(0);
            expect(locations[0].name).toBeDefined();
            expect(locations[0].demandLevel).toBeDefined();
        });
    });
    describe('Zod Input Validation Upgrades', () => {
        const validBaseBooking = {
            customerId: 'd5c589b2-311e-4ab8-912c-15a0fa067a5b',
            fundiId: 'e8b8cb1d-2856-4c74-8848-f58c7cc548e6',
            professionId: 'aa1cbb3d-4c75-4d2c-8cd7-1f8d8ee45999',
            date: '2026-07-20',
            time: '14:30',
            address: 'Mikocheni B, Block 12',
            description: 'AC water leakage fix',
            servicePrice: 35000.00,
            customerBudget: 40000.00,
            isEmergency: false
        };
        it('should pass validation when paymentOption and corporateId are absent', () => {
            const result = validationMiddleware_1.bookingCreateSchema.safeParse(validBaseBooking);
            expect(result.success).toBe(true);
        });
        it('should pass validation with valid paymentOption ("online" or "offline")', () => {
            const onlineResult = validationMiddleware_1.bookingCreateSchema.safeParse({
                ...validBaseBooking,
                paymentOption: 'online'
            });
            const offlineResult = validationMiddleware_1.bookingCreateSchema.safeParse({
                ...validBaseBooking,
                paymentOption: 'offline'
            });
            expect(onlineResult.success).toBe(true);
            expect(offlineResult.success).toBe(true);
        });
        it('should pass validation with a valid corporateId UUID', () => {
            const corpResult = validationMiddleware_1.bookingCreateSchema.safeParse({
                ...validBaseBooking,
                corporateId: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'
            });
            expect(corpResult.success).toBe(true);
        });
        it('should reject validation if corporateId is not a valid UUID', () => {
            const invalidCorpResult = validationMiddleware_1.bookingCreateSchema.safeParse({
                ...validBaseBooking,
                corporateId: 'invalid-uuid-string'
            });
            expect(invalidCorpResult.success).toBe(false);
        });
    });
});
