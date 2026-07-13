"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const logger_1 = __importDefault(require("../config/logger"));
class MpesaProvider {
    async initiatePayment(amount, phoneNumber, referenceId) {
        logger_1.default.info(`[M-Pesa PUSH Gateway] Dispatched USSD PIN Prompt request. Amount: ${amount} TZS, To: ${phoneNumber}`);
        // Simulates returning a unique gateway transaction tracking ID
        return `mpesa_txn_${Math.random().toString(36).substring(2, 10)}`;
    }
    async verifyPayment(transactionId) {
        logger_1.default.info(`[M-Pesa PUSH Gateway] Querying payment status for transaction: ${transactionId}`);
        return true; // Mock verification success
    }
}
class TigoPesaProvider {
    async initiatePayment(amount, phoneNumber, referenceId) {
        logger_1.default.info(`[Tigo Pesa Gateway] Initiating PUSH request. Amount: ${amount} TZS, Target: ${phoneNumber}`);
        return `tigopesa_txn_${Math.random().toString(36).substring(2, 10)}`;
    }
    async verifyPayment(transactionId) {
        return true;
    }
}
class AirtelMoneyProvider {
    async initiatePayment(amount, phoneNumber, referenceId) {
        logger_1.default.info(`[Airtel Money Gateway] Initiating PUSH request. Amount: ${amount} TZS, Target: ${phoneNumber}`);
        return `airtel_txn_${Math.random().toString(36).substring(2, 10)}`;
    }
    async verifyPayment(transactionId) {
        return true;
    }
}
class PaymentService {
    /**
     * Resolves the corresponding mobile provider based on network dialing prefixes
     */
    static getProvider(phoneNumber) {
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
exports.PaymentService = PaymentService;
