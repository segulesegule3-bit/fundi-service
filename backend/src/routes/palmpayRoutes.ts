import { Router } from 'express';
import { PalmPayController } from '../controllers/palmpayController';
import { authenticateJWT } from '../middlewares/authGuard';

export const palmpayRouter = Router();

palmpayRouter.post('/payments/palmpay/create', authenticateJWT, PalmPayController.createPayment);
palmpayRouter.post('/payments/palmpay/verify', PalmPayController.verifyPayment);
palmpayRouter.post('/webhooks/palmpay', PalmPayController.webhook);
