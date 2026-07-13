"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PalmPayController = void 0;
const palmpayService_1 = require("../services/palmpayService");
const walletService_1 = require("../services/walletService");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../config/logger"));
class PalmPayController {
    /**
     * Initiate a PalmPay payment request
     */
    static async createPayment(req, res) {
        const userId = req.user?.id;
        const { amount, phoneNumber, referenceId, isBookingPayment } = req.body;
        if (!amount || !phoneNumber || !referenceId) {
            res.status(400).json({
                success: false,
                message: 'Invalid request: amount, phone number, and reference ID are required',
                errorCode: 'BAD_REQUEST',
            });
            return;
        }
        try {
            // 1. Idempotency Check: check if transaction with this referenceId already exists
            const existingTx = await prisma_1.default.paymentTransaction.findUnique({
                where: { referenceId },
            });
            if (existingTx) {
                res.status(409).json({
                    success: false,
                    message: 'Conflict: Duplicate transaction reference detected',
                    errorCode: 'DUPLICATE_TRANSACTION',
                });
                return;
            }
            // 2. Create pending transaction row
            const transaction = await prisma_1.default.paymentTransaction.create({
                data: {
                    userId: userId,
                    provider: 'PALMPAY',
                    amount,
                    status: 'PENDING',
                    referenceId,
                    phoneNumber,
                },
            });
            // 3. Dispatch gateway request to PalmPay
            const gatewayResponse = await palmpayService_1.PalmPayService.createPaymentRequest({
                amount,
                referenceId,
                phoneNumber,
            });
            // 4. Update transaction with provider transaction ID
            const updatedTx = await prisma_1.default.paymentTransaction.update({
                where: { id: transaction.id },
                data: {
                    providerTransactionId: gatewayResponse.gatewayTransactionId,
                },
            });
            res.status(201).json({
                success: true,
                message: 'PalmPay transaction created successfully',
                data: {
                    transactionId: updatedTx.id,
                    providerTransactionId: updatedTx.providerTransactionId,
                    checkoutUrl: gatewayResponse.checkoutUrl,
                },
            });
        }
        catch (error) {
            logger_1.default.error(`[PalmPay Create] Initiation error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Payment creation failed due to gateway timeout',
                errorCode: 'GATEWAY_TIMEOUT',
            });
        }
    }
    /**
     * Handle Webhook Callbacks from PalmPay Tanzania
     */
    static async webhook(req, res) {
        const signature = req.headers['x-palmpay-signature'];
        const payload = req.body;
        if (!signature) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized: Webhook signature header missing',
                errorCode: 'INVALID_SIGNATURE',
            });
            return;
        }
        // 1. Check signature validity
        const verified = palmpayService_1.PalmPayService.verifyWebhookSignature(payload, signature);
        // 2. Log Webhook Callback event in DB
        await prisma_1.default.webhookLog.create({
            data: {
                provider: 'PALMPAY',
                payload,
                signature,
                verified,
            },
        });
        if (!verified) {
            logger_1.default.warn('[PalmPay Webhook] Callback rejected due to invalid digital signature');
            res.status(401).json({
                success: false,
                message: 'Unauthorized: Webhook signature verification failed',
                errorCode: 'INVALID_SIGNATURE',
            });
            return;
        }
        const { referenceId, providerTransactionId, status, amount } = payload;
        try {
            // 3. Find target transaction
            const transaction = await prisma_1.default.paymentTransaction.findUnique({
                where: { referenceId },
            });
            if (!transaction) {
                res.status(404).json({
                    success: false,
                    message: 'Payment transaction record not found',
                    errorCode: 'TRANSACTION_NOT_FOUND',
                });
                return;
            }
            // Check if already processed to prevent double crediting/replay attacks
            if (transaction.status !== 'PENDING') {
                res.status(200).json({
                    success: true,
                    message: 'Webhook already processed (Idempotent)',
                });
                return;
            }
            // 4. Update Transaction status based on status payload
            const finalStatus = status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
            await prisma_1.default.paymentTransaction.update({
                where: { id: transaction.id },
                data: {
                    status: finalStatus,
                    providerTransactionId,
                },
            });
            if (finalStatus === 'SUCCESS') {
                // 5. Credit user's wallet
                await walletService_1.WalletService.deposit(transaction.userId, transaction.amount.toNumber(), referenceId);
                logger_1.default.info(`[PalmPay Webhook] Successfully processed payment and credited wallet for user: ${transaction.userId}`);
            }
            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully',
            });
        }
        catch (error) {
            logger_1.default.error(`[PalmPay Webhook] Processing failed: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Internal processing error',
                errorCode: 'INTERNAL_ERROR',
            });
        }
    }
    /**
     * Verify individual payment status
     */
    static async verifyPayment(req, res) {
        const { referenceId } = req.body;
        if (!referenceId) {
            res.status(400).json({
                success: false,
                message: 'Reference ID is required',
                errorCode: 'BAD_REQUEST',
            });
            return;
        }
        try {
            const transaction = await prisma_1.default.paymentTransaction.findUnique({
                where: { referenceId },
            });
            if (!transaction) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found',
                    errorCode: 'TRANSACTION_NOT_FOUND',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Transaction verification details retrieved',
                data: {
                    id: transaction.id,
                    referenceId: transaction.referenceId,
                    status: transaction.status,
                    amount: transaction.amount,
                    updatedAt: transaction.updatedAt,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Transaction lookup failed',
                errorCode: 'INTERNAL_ERROR',
            });
        }
    }
}
exports.PalmPayController = PalmPayController;
