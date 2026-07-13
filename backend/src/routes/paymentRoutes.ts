import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';

export const paymentRouter = Router();

paymentRouter.post('/initiate', PaymentController.initiate);
paymentRouter.post('/webhook/:provider', PaymentController.webhook);
