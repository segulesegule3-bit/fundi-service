import logger from '../config/logger';

export interface PaymentProvider {
  initiatePayment(amount: number, phoneNumber: string, referenceId: string): Promise<string>;
  verifyPayment(transactionId: string): Promise<boolean>;
}

class MpesaProvider implements PaymentProvider {
  public async initiatePayment(amount: number, phoneNumber: string, referenceId: string): Promise<string> {
    logger.info(`[M-Pesa PUSH Gateway] Dispatched USSD PIN Prompt request. Amount: ${amount} TZS, To: ${phoneNumber}`);
    // Simulates returning a unique gateway transaction tracking ID
    return `mpesa_txn_${Math.random().toString(36).substring(2, 10)}`;
  }

  public async verifyPayment(transactionId: string): Promise<boolean> {
    logger.info(`[M-Pesa PUSH Gateway] Querying payment status for transaction: ${transactionId}`);
    return true; // Mock verification success
  }
}

class TigoPesaProvider implements PaymentProvider {
  public async initiatePayment(amount: number, phoneNumber: string, referenceId: string): Promise<string> {
    logger.info(`[Tigo Pesa Gateway] Initiating PUSH request. Amount: ${amount} TZS, Target: ${phoneNumber}`);
    return `tigopesa_txn_${Math.random().toString(36).substring(2, 10)}`;
  }

  public async verifyPayment(transactionId: string): Promise<boolean> {
    return true;
  }
}

class AirtelMoneyProvider implements PaymentProvider {
  public async initiatePayment(amount: number, phoneNumber: string, referenceId: string): Promise<string> {
    logger.info(`[Airtel Money Gateway] Initiating PUSH request. Amount: ${amount} TZS, Target: ${phoneNumber}`);
    return `airtel_txn_${Math.random().toString(36).substring(2, 10)}`;
  }

  public async verifyPayment(transactionId: string): Promise<boolean> {
    return true;
  }
}

export class PaymentService {
  /**
   * Resolves the corresponding mobile provider based on network dialing prefixes
   */
  public static getProvider(phoneNumber: string): PaymentProvider {
    // Tanzanian prefixes rules:
    // M-Pesa: Vodacom (074, 075, 076)
    // Tigo Pesa: (065, 067, 071)
    // Airtel Money: (068, 069, 078)
    const cleanPhone = phoneNumber.replace('+', '');
    
    if (cleanPhone.startsWith('25574') || cleanPhone.startsWith('25575') || cleanPhone.startsWith('25576')) {
      return new MpesaProvider();
    }
    if (cleanPhone.startsWith('25565') || cleanPhone.startsWith('25567') || cleanPhone.startsWith('25571')) {
      return new TigoPesaProvider();
    }
    return new AirtelMoneyProvider();
  }
}
