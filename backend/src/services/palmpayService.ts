import crypto from 'crypto';
import logger from '../config/logger';

const PALMPAY_API_KEY = process.env.PALMPAY_API_KEY || 'palmpay_secure_fintech_api_key_secret_2026';
const PALMPAY_MERCHANT_ID = process.env.PALMPAY_MERCHANT_ID || 'merchant_12345';
const PALMPAY_BASE_URL = process.env.PALMPAY_BASE_URL || 'https://api.palmpay.co.tz';

export class PalmPayService {
  /**
   * Generates signature for PalmPay request validation
   */
  public static generateSignature(payload: any): string {
    const dataString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', PALMPAY_API_KEY)
      .update(dataString)
      .digest('hex');
  }

  /**
   * Verifies incoming PalmPay Webhook signature integrity
   */
  public static verifyWebhookSignature(payload: any, signature: string): boolean {
    const dataString = JSON.stringify(payload);
    const calculated = crypto
      .createHmac('sha256', PALMPAY_API_KEY)
      .update(dataString)
      .digest('hex');
    
    return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signature));
  }

  /**
   * Dispatches direct request to PalmPay API
   */
  public static async createPaymentRequest(data: { amount: number; referenceId: string; phoneNumber: string }): Promise<{ gatewayTransactionId: string; checkoutUrl: string }> {
    const payload = {
      merchantId: PALMPAY_MERCHANT_ID,
      amount: data.amount,
      currency: 'TZS',
      referenceId: data.referenceId,
      phoneNumber: data.phoneNumber,
      timestamp: Date.now(),
    };

    const signature = PalmPayService.generateSignature(payload);
    
    logger.info(`[PalmPay API] Dispatched Create Payment. Ref: ${data.referenceId}, Amount: ${data.amount} TZS`);

    // In production, execute axios post request:
    // const res = await axios.post(`${PALMPAY_BASE_URL}/v1/payments/create`, payload, { headers: { 'X-PalmPay-Signature': signature } });
    
    // Simulate gateway response values
    const gatewayTransactionId = `palmpay_tx_${crypto.randomBytes(4).toString('hex')}`;
    const checkoutUrl = `${PALMPAY_BASE_URL}/checkout/${gatewayTransactionId}`;

    return { gatewayTransactionId, checkoutUrl };
  }
}
