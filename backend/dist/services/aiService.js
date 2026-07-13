"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const gpsService_1 = require("./gpsService");
const logger_1 = __importDefault(require("../config/logger"));
const prisma_1 = __importDefault(require("../config/prisma"));
const db_1 = require("../db");
class AIService {
    /**
     * 1. Smart Matching Engine
     * Ranks candidates based on distance, ratings, and workload factors
     */
    static calculateMatchScore(fundiId, clientLat, clientLng, rating) {
        const coords = gpsService_1.GPSService.getLocation(fundiId);
        let distance = 5.0; // default assumptions if no live coordinates exist
        if (coords) {
            distance = gpsService_1.GPSService.calculateDistance(clientLat, clientLng, coords.latitude, coords.longitude);
        }
        // Matching Scoring weights:
        // Distance weight: 50% (closer is higher score, up to 10km)
        // Rating weight: 50% (higher rating increases score)
        const distanceScore = Math.max(0, 100 - distance * 10); // 10km radius max limit
        const ratingScore = rating * 20; // scale 0-5 rating to 0-100 scale
        const finalScore = Math.round(distanceScore * 0.5 + ratingScore * 0.5);
        return Math.min(100, Math.max(0, finalScore));
    }
    /**
     * 2. Dynamic Price Estimation
     * Returns price ranges based on service category and urgency multipliers
     */
    static estimatePrice(category, urgency) {
        let baseMin = 15000;
        let baseMax = 35000;
        switch (category.toLowerCase()) {
            case 'electrical':
            case 'electrician':
                baseMin = 25000;
                baseMax = 60000;
                break;
            case 'plumbing':
            case 'plumber':
                baseMin = 20000;
                baseMax = 50000;
                break;
            case 'hvac':
            case 'ac repair':
                baseMin = 35000;
                baseMax = 85000;
                break;
        }
        const multiplier = urgency.toLowerCase() === 'emergency' ? 1.5 : 1.0;
        return {
            minPrice: Math.round(baseMin * multiplier),
            maxPrice: Math.round(baseMax * multiplier),
            recommendedPrice: Math.round(((baseMin + baseMax) / 2) * multiplier),
        };
    }
    /**
     * 3. Fraud Detection Engine
     * Calculates fraud rating, flags accounts on high risks
     */
    static async checkFraudScore(userId, flags) {
        let score = 0;
        if (flags.isFakeGps)
            score += 60;
        if (flags.cancellationCount > 3)
            score += 30;
        if (score >= 80) {
            logger_1.default.warn(`[AI Fraud Alert] User ${userId} exceeded safety thresholds. Suspending account automatically...`);
            // Auto-suspend user account in database
            await prisma_1.default.user.update({
                where: { id: userId },
                data: { isActive: false },
            });
        }
        return score;
    }
    /**
     * 4. Demand Prediction Heatmaps
     */
    static getDemandInsights(region) {
        return {
            region,
            peakHour: '14:00 - 17:00 TZS',
            highDemandCategories: ['Electrical', 'AC Repair'],
            imbalanceAlert: true,
            heatmapPoints: [
                { lat: -6.7823, lng: 39.2612, weight: 8 },
                { lat: -6.7901, lng: 39.2505, weight: 5 },
            ]
        };
    }
    /**
     * 5. AI FAQ support assistant Chatbot
     */
    static async chatbotReply(message) {
        const cleanMsg = message.toLowerCase();
        if (cleanMsg.includes('bei') || cleanMsg.includes('pricing') || cleanMsg.includes('gharama')) {
            return "Gharama za huduma zinatofautiana kulingana na aina ya kazi (k.m. Ufundi wa Umeme, Mabomba, AC) na dharura ya kazi hiyo. Unaweza kupata makadirio ya bei moja kwa moja kwenye skrini ya uombaji huduma.";
        }
        if (cleanMsg.includes('booking') || cleanMsg.includes('omba ufundi') || cleanMsg.includes('tengeneza')) {
            return "Ili kuomba huduma, chagua kategoria ya fundi unayemhitaji kwenye ukurasa wa nyumbani, eleza changamoto yako kwa kifupi, kisha mfumo wetu utamtafuta fundi bora wa karibu yako kiotomatiki.";
        }
        if (cleanMsg.includes('salio') || cleanMsg.includes('wallet') || cleanMsg.includes('kutoa hela')) {
            return "Unaweza kuongeza au kutoa fedha kwenye Wallet yako kupitia mifumo salama ya malipo ya simu kama M-Pesa, Airtel Money, Tigo Pesa na PalmPay Tanzania.";
        }
        return "Habari! Mimi ni AI Support Assistant wa Fundi Service Tanzania. Unaweza kuniuliza kuhusu bei za huduma, jinsi ya kuomba fundi, au matatizo ya malipo ya Wallet.";
    }
    /**
     * 6. AI Fair Market Price Recommendation
     */
    static getFairMarketPrice(category) {
        let fairPrice = 25000;
        switch (category.toLowerCase()) {
            case 'electrical':
            case 'electrician':
                fairPrice = 45000;
                break;
            case 'plumbing':
            case 'plumber':
                fairPrice = 30000;
                break;
            case 'hvac':
            case 'ac repair':
                fairPrice = 60000;
                break;
        }
        return { fairPrice, currency: 'TZS' };
    }
    /**
     * 7. Popular Services Recommendations
     */
    static getPopularServices() {
        return ['Laptop Repair', 'AC Maintenance', 'House Wiring', 'Water Leak Repair', 'Deep Cleaning'];
    }
    /**
     * 8. High-demand Locations Lookup
     */
    static getHighDemandLocations() {
        return [
            { lat: -6.7823, lng: 39.2612, name: 'Mikocheni B', demandLevel: 'High' },
            { lat: -6.8163, lng: 39.2766, name: 'Kariakoo Market', demandLevel: 'Critical' },
            { lat: -6.7924, lng: 39.2083, name: 'Mbezi Beach', demandLevel: 'Medium' }
        ];
    }
    /**
     * 9. Recommend warranty duration based on service type
     */
    static recommendWarranty(category) {
        switch (category.toLowerCase()) {
            case 'electrical':
            case 'electrician':
                return '90 Days';
            case 'plumbing':
            case 'plumber':
                return '30 Days';
            case 'hvac':
            case 'ac repair':
                return '6 Months';
            case 'construction':
            case 'carpenter':
                return '1 Year';
            default:
                return '14 Days';
        }
    }
    /**
     * 10. Detect abnormal warranty claim patterns
     */
    static async detectAbnormalClaimPatterns(fundiId) {
        try {
            const claimsRes = await db_1.db.query(`SELECT COUNT(*) as count 
         FROM warranty_claims wc
         JOIN warranties w ON wc.warranty_id = w.id
         JOIN bookings b ON w.booking_id = b.id
         WHERE b.fundi_id = $1 AND wc.status = 'ACCEPTED'`, [fundiId]);
            const acceptedClaims = parseInt(claimsRes.rows[0].count);
            return acceptedClaims > 3;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }
    /**
     * 11. Identify high-risk Fundis based on Trust Score < 60
     */
    static async identifyHighRiskFundis() {
        try {
            const risksRes = await db_1.db.query(`SELECT ts.*, u.full_name as fundi_name
         FROM trust_scores ts
         JOIN fundi_profiles fp ON ts.fundi_profile_id = fp.id
         JOIN users u ON fp.user_id = u.id
         WHERE ts.score < 60`);
            return risksRes.rows;
        }
        catch (err) {
            console.error(err);
            return [];
        }
    }
}
exports.AIService = AIService;
