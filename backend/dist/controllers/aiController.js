"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const aiService_1 = require("../services/aiService");
class AIController {
    /**
     * Post Match rating scores for a candidate fundi
     */
    static async matchFundi(req, res) {
        const { fundiId, clientLat, clientLng, rating } = req.body;
        if (!fundiId || !clientLat || !clientLng) {
            res.status(400).json({
                success: false,
                message: 'Invalid arguments: fundi ID and client coordinates are required',
                errorCode: 'BAD_REQUEST',
            });
            return;
        }
        try {
            const score = aiService_1.AIService.calculateMatchScore(fundiId, parseFloat(clientLat), parseFloat(clientLng), parseFloat(rating || '4.0'));
            res.status(200).json({
                success: true,
                message: 'AI matching score calculated successfully',
                data: {
                    fundiId,
                    matchScore: score,
                },
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message, errorCode: 'INTERNAL_ERROR' });
        }
    }
    /**
     * Request dynamic price estimation
     */
    static async priceEstimate(req, res) {
        const { category, urgency } = req.body;
        if (!category) {
            res.status(400).json({
                success: false,
                message: 'Invalid arguments: service category is required',
                errorCode: 'BAD_REQUEST',
            });
            return;
        }
        try {
            const estimation = aiService_1.AIService.estimatePrice(category, urgency || 'normal');
            res.status(200).json({
                success: true,
                message: 'Dynamic price estimation completed successfully',
                data: estimation,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message, errorCode: 'INTERNAL_ERROR' });
        }
    }
    /**
     * Fraud Risk checking
     */
    static async fraudCheck(req, res) {
        const { userId, cancellationCount, isFakeGps } = req.body;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required for fraud checks',
                errorCode: 'BAD_REQUEST',
            });
            return;
        }
        try {
            const score = await aiService_1.AIService.checkFraudScore(userId, {
                cancellationCount: parseInt(cancellationCount || '0'),
                isFakeGps: !!isFakeGps,
            });
            res.status(200).json({
                success: true,
                message: 'AI fraud threat assessment completed',
                data: {
                    userId,
                    fraudScore: score,
                    status: score >= 80 ? 'SUSPENDED' : 'CLEAN',
                },
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message, errorCode: 'INTERNAL_ERROR' });
        }
    }
    /**
     * Demand insights heatmaps
     */
    static async demandInsights(req, res) {
        const { region } = req.query;
        try {
            const insights = aiService_1.AIService.getDemandInsights(region || 'Dar es Salaam');
            res.status(200).json({
                success: true,
                message: 'Geospatial demand heatmaps generated successfully',
                data: insights,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message, errorCode: 'INTERNAL_ERROR' });
        }
    }
    /**
     * AI support Chatbot reply
     */
    static async chatSupport(req, res) {
        const { message } = req.body;
        if (!message) {
            res.status(400).json({
                success: false,
                message: 'Message content is required',
                errorCode: 'BAD_REQUEST',
            });
            return;
        }
        try {
            const reply = await aiService_1.AIService.chatbotReply(message);
            res.status(200).json({
                success: true,
                message: 'Chatbot reply generated',
                data: { reply },
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message, errorCode: 'INTERNAL_ERROR' });
        }
    }
    /**
     * Request fair market price recommendation
     */
    static async fairMarketPrice(req, res) {
        const { category } = req.query;
        try {
            const result = aiService_1.AIService.getFairMarketPrice(category || 'electrical');
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Fetch popular services
     */
    static async popularServices(req, res) {
        try {
            const result = aiService_1.AIService.getPopularServices();
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Fetch high-demand locations
     */
    static async highDemandLocations(req, res) {
        try {
            const result = aiService_1.AIService.getHighDemandLocations();
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Recommend warranty duration based on service type
     */
    static async recommendWarranty(req, res) {
        const { category } = req.query;
        try {
            const result = aiService_1.AIService.recommendWarranty(category || 'general');
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Scan high risk fundi profiles
     */
    static async highRiskFundis(req, res) {
        try {
            const result = await aiService_1.AIService.identifyHighRiskFundis();
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.AIController = AIController;
