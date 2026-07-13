import crypto from 'crypto';

const SECRET_KEY = process.env.TRANSACTION_SECRET || 'secure_fintech_escrow_secret_key';

export class FinancialHelper {
  /**
   * Generates a tamper-proof SHA-256 HMAC signature for a ledger transaction
   */
  public static calculateSignature(walletId: string, amount: string, type: string, referenceId: string): string {
    return crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${walletId}:${amount}:${type}:${referenceId || 'none'}`)
      .digest('hex');
  }

  /**
   * Verifies that a transaction's signature is correct and hasn't been altered
   */
  public static verifySignature(walletId: string, amount: string, type: string, referenceId: string, signature: string): boolean {
    const calculated = FinancialHelper.calculateSignature(walletId, amount, type, referenceId);
    return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signature));
  }
}
