"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const logger_1 = __importDefault(require("../config/logger"));
class NotificationService {
    /**
     * Simulated SMS gateway dispatch (integrates with providers like Beem, Selcom, or Twilio)
     */
    static async sendSMS(phoneNumber, message) {
        logger_1.default.info(`[SMS Gateway] Dispatched to ${phoneNumber}: "${message}"`);
        return true;
    }
    /**
     * Simulated Email gateway dispatch (Nodemailer, SendGrid, or AWS SES)
     */
    static async sendEmail(email, subject, htmlContent) {
        logger_1.default.info(`[Email Gateway] Dispatched to ${email} (Subject: ${subject})`);
        return true;
    }
    /**
     * Trigger SMS OTP notification
     */
    static async sendOTP(phoneNumber, otpCode) {
        const message = `Fundi Service Tanzania: Namba yako ya uhakiki ni ${otpCode}. Namba hii itaisha baada ya dakika 5. Usimpe mtu yeyote!`;
        return NotificationService.sendSMS(phoneNumber, message);
    }
    /**
     * Trigger Login notification alert
     */
    static async sendLoginAlert(email, device, ip) {
        const subject = 'Fundi Service Tanzania: New Login Detected';
        const html = `<p>Habari,</p><p>A mpya ya kuingia (new login) imegunduliwa kwenye akunti yako ya Fundi Service kutoka kwenye kifaa: <b>${device}</b> (IP: ${ip}). Ikiwa si wewe, tafadhali badilisha nenosiri lako haraka.</p>`;
        return NotificationService.sendEmail(email, subject, html);
    }
}
exports.NotificationService = NotificationService;
