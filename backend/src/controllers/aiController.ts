import { Request, Response } from 'express';
import { AIService } from '../services/aiService';

export class AIController {
  /**
   * Post Match rating scores for a candidate fundi
   */
  public static async matchFundi(req: Request, res: Response): Promise<void> {
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
      const score = AIService.calculateMatchScore(fundiId, parseFloat(clientLat), parseFloat(clientLng), parseFloat(rating || '4.0'));
      res.status(200).json({
        success: true,
        message: 'AI matching score calculated successfully',
        data: {
          fundiId,
          matchScore: score,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message, errorCode: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Request dynamic price estimation
   */
  public static async priceEstimate(req: Request, res: Response): Promise<void> {
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
      const estimation = AIService.estimatePrice(category, urgency || 'normal');
      res.status(200).json({
        success: true,
        message: 'Dynamic price estimation completed successfully',
        data: estimation,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message, errorCode: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Fraud Risk checking
   */
  public static async fraudCheck(req: Request, res: Response): Promise<void> {
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
      const score = await AIService.checkFraudScore(userId, {
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
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message, errorCode: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Demand insights heatmaps
   */
  public static async demandInsights(req: Request, res: Response): Promise<void> {
    const { region } = req.query;

    try {
      const insights = AIService.getDemandInsights((region as string) || 'Dar es Salaam');
      res.status(200).json({
        success: true,
        message: 'Geospatial demand heatmaps generated successfully',
        data: insights,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message, errorCode: 'INTERNAL_ERROR' });
    }
  }

  /**
   * AI support Chatbot reply
   */
  public static async chatSupport(req: Request, res: Response): Promise<void> {
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
      const reply = await AIService.chatbotReply(message);
      res.status(200).json({
        success: true,
        message: 'Chatbot reply generated',
        data: { reply },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message, errorCode: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Request fair market price recommendation
   */
  public static async fairMarketPrice(req: Request, res: Response): Promise<void> {
    const { category } = req.query;
    try {
      const result = AIService.getFairMarketPrice((category as string) || 'electrical');
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Fetch popular services
   */
  public static async popularServices(req: Request, res: Response): Promise<void> {
    try {
      const result = AIService.getPopularServices();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Fetch high-demand locations
   */
  public static async highDemandLocations(req: Request, res: Response): Promise<void> {
    try {
      const result = AIService.getHighDemandLocations();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Recommend warranty duration based on service type
   */
  public static async recommendWarranty(req: Request, res: Response): Promise<void> {
    const { category } = req.query;
    try {
      const result = AIService.recommendWarranty((category as string) || 'general');
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Scan high risk fundi profiles
   */
  public static async highRiskFundis(req: Request, res: Response): Promise<void> {
    try {
      const result = await AIService.identifyHighRiskFundis();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
