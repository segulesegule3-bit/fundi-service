import { Router } from 'express';
import { AIController } from '../controllers/aiController';

export const aiRouter = Router();

aiRouter.post('/ai/match-fundi', AIController.matchFundi);
aiRouter.post('/ai/price-estimate', AIController.priceEstimate);
aiRouter.post('/ai/fraud-check', AIController.fraudCheck);
aiRouter.get('/ai/demand-insights', AIController.demandInsights);
aiRouter.post('/ai/chat', AIController.chatSupport);
aiRouter.get('/ai/fair-market-price', AIController.fairMarketPrice);
aiRouter.get('/ai/popular-services', AIController.popularServices);
aiRouter.get('/ai/high-demand-locations', AIController.highDemandLocations);
aiRouter.get('/ai/recommend-warranty', AIController.recommendWarranty);
aiRouter.get('/ai/high-risk-fundis', AIController.highRiskFundis);
