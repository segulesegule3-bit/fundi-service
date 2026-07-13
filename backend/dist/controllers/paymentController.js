"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const paymentService_1 = require("../services/paymentService");
const walletService_1 = require("../services/walletService");
const logger_1 = __importDefault(require("../config/logger"));
class PaymentController {
    /**
     * Initiate a mobile money payment prompt
     */
    static async initiate(req, res) {
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
            const provider = paymentService_1.PaymentService.getProvider(phoneNumber);
            const gatewayTxId = await provider.initiatePayment(amount, phoneNumber, referenceId || `pay_${Date.now()}`);
            res.status(200).json({
                success: true,
                message: 'Payment push prompt dispatched successfully',
                data: {
                    gatewayTxId,
                    referenceId,
                },
            });
        }
        catch (error) {
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
    static async webhook(req, res) {
        const { provider } = req.params;
        const payload = req.body;
        logger_1.default.info(`[Webhook Callback] Received payment confirmation notification from network: ${provider}. Payload: ${JSON.stringify(payload)}`);
        // In production, verify HMAC signatures on webhook request headers to prevent fake callbacks.
        const { referenceId, amount, status, userId } = payload;
        try {
            if (status === 'success') {
                // Automatically credit wallet upon successful mobile money push confirmation
                await walletService_1.WalletService.deposit(userId, parseFloat(amount), referenceId);
                logger_1.default.info(`[Webhook Success] Credited ${amount} TZS to User ${userId} wallet`);
            }
            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully',
            });
        }
        catch (error) {
            logger_1.default.error(`[Webhook Error] Processing callback failed: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Webhook processing failed',
                errors: [error.message],
            });
        }
    }
}
exports.PaymentController = PaymentController;
