import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { WalletService } from '../services/walletService';
import prisma from '../config/prisma';
import logger from '../config/logger';

export class PaymentController {
  /**
   * Initiate a mobile money payment prompt
   */
  public static async initiate(req: Request, res: Response): Promise<void> {
    const { amount, phoneNumber, referenceId } = req.body;

    if (!amount || !phoneNumber) {
      res.status(400).json({
        success: false,
        message: 'Payment initiation failed',
        errors: ['Amount and phone number are required'],
      });
      return;
    }

    try {
      const provider = PaymentService.getProvider(phoneNumber);
      const gatewayTxId = await provider.initiatePayment(amount, phoneNumber, referenceId || `pay_${Date.now()}`);

      res.status(200).json({
        success: true,
        message: 'Payment push prompt dispatched successfully',
        data: {
          gatewayTxId,
          referenceId,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Payment initiation failed',
        errors: [error.message],
      });
    }
  }

  /**
   * Universal Webhook handler to receive status updates from Tanzanian Mobile Networks
   */
  public static async webhook(req: Request, res: Response): Promise<void> {
    const { provider } = req.params;
    const payload = req.body;

    logger.info(`[Webhook Callback] Received payment confirmation notification from network: ${provider}. Payload: ${JSON.stringify(payload)}`);

    // In production, verify HMAC signatures on webhook request headers to prevent fake callbacks.
    const { referenceId, amount, status, userId } = payload;

    try {
      if (status === 'success') {
        // Automatically credit wallet upon successful mobile money push confirmation
        await WalletService.deposit(userId, parseFloat(amount), referenceId);
        logger.info(`[Webhook Success] Credited ${amount} TZS to User ${userId} wallet`);
      }

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
      });
    } catch (error: any) {
      logger.error(`[Webhook Error] Processing callback failed: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        errors: [error.message],
      });
    }
  }
}
