"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PalmPayService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../config/logger"));
const PALMPAY_API_KEY = process.env.PALMPAY_API_KEY || 'palmpay_secure_fintech_api_key_secret_2026';
const PALMPAY_MERCHANT_ID = process.env.PALMPAY_MERCHANT_ID || 'merchant_12345';
const PALMPAY_BASE_URL = process.env.PALMPAY_BASE_URL || 'https://api.palmpay.co.tz';
class PalmPayService {
    /**
     * Generates signature for PalmPay request validation
     */
    static generateSignature(payload) {
        const dataString = JSON.stringify(payload);
        return crypto_1.default
            .createHmac('sha256', PALMPAY_API_KEY)
            .update(dataString)
            .digest('hex');
    }
    /**
     * Verifies incoming PalmPay Webhook signature integrity
     */
    static verifyWebhookSignature(payload, signature) {
        const dataString = JSON.stringify(payload);
        const calculated = crypto_1.default
            .createHmac('sha256', PALMPAY_API_KEY)
            .update(dataString)
            .digest('hex');
        return crypto_1.default.timingSafeEqual(Buffer.from(calculated), Buffer.from(signature));
    }
    /**
     * Dispatches direct request to PalmPay API
     */
    static async createPaymentRequest(data) {
        const payload = {
            merchantId: PALMPAY_MERCHANT_ID,
            amount: data.amount,
            currency: 'TZS',
            referenceId: data.referenceId,
            phoneNumber: data.phoneNumber,
            timestamp: Date.now(),
        };
        const signature = PalmPayService.generateSignature(payload);
        logger_1.default.info(`[PalmPay API] Dispatched Create Payment. Ref: ${data.referenceId}, Amount: ${data.amount} TZS`);
        // In production, execute axios post request:
        // const res = await axios.post(`${PALMPAY_BASE_URL}/v1/payments/create`, payload, { headers: { 'X-PalmPay-Signature': signature } });
        // Simulate gateway response values
        const gatewayTransactionId = `palmpay_tx_${crypto_1.default.randomBytes(4).toString('hex')}`;
        const checkoutUrl = `${PALMPAY_BASE_URL}/checkout/${gatewayTransactionId}`;
        return { gatewayTransactionId, checkoutUrl };
    }
}
exports.PalmPayService = PalmPayService;
