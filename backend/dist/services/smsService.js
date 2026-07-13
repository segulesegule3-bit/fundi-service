"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class SMSService {
    static gateway = process.env.SMS_GATEWAY || 'mock';
    /**
     * Send SMS using configured provider
     * @param to Phone number with international format (e.g. +255711223344)
     * @param text Message body
     */
    static async sendSMS(to, text) {
        console.log(`[SMS Service] Dispatching via [${this.gateway}] to ${to}: "${text}"`);
        switch (this.gateway.toLowerCase()) {
            case 'beem':
                return this.sendBeemSMS(to, text);
            case 'twilio':
                return this.sendTwilioSMS(to, text);
            case 'africastalking':
                return this.sendAfricasTalkingSMS(to, text);
            case 'mock':
            default:
                return this.sendMockSMS(to, text);
        }
    }
    static async sendBeemSMS(to, text) {
        // Beem Africa SMS API Integration
        const apiKey = process.env.BEEM_API_KEY;
        const secretKey = process.env.BEEM_SECRET_KEY;
        const senderId = process.env.BEEM_SENDER_ID || 'INFO';
        if (!apiKey || !secretKey) {
            return { success: false, error: 'Beem credentials missing from .env configuration' };
        }
        try {
            // Beem requires numbers without the '+' sign
            const cleanPhone = to.replace('+', '');
            const payload = {
                source_addr: senderId,
                schedule_time: '',
                message: text,
                recipients: [
                    { recipient_id: 1, dest_addr: cleanPhone }
                ]
            };
            const auth = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');
            const response = await fetch('https://api.beem.africa/v1/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: `Beem API responded with ${response.status}: ${errorText}` };
            }
            const data = await response.json();
            if (data.code === 200 || data.code === 201) {
                return { success: true, messageId: `beem-${Date.now()}` };
            }
            else {
                return { success: false, error: data.message || 'Unknown response code from Beem' };
            }
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
    static async sendTwilioSMS(to, text) {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_PHONE_NUMBER;
        if (!sid || !token || !from) {
            return { success: false, error: 'Twilio credentials missing from .env configuration' };
        }
        try {
            const auth = Buffer.from(`${sid}:${token}`).toString('base64');
            const params = new URLSearchParams();
            params.append('To', to);
            params.append('From', from);
            params.append('Body', text);
            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${auth}`
                },
                body: params
            });
            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: `Twilio API responded with ${response.status}: ${errorText}` };
            }
            const data = await response.json();
            return { success: true, messageId: data.sid };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
    static async sendAfricasTalkingSMS(to, text) {
        // Mock implementation for Africa's Talking API
        return { success: true, messageId: `africastalking-${Date.now()}` };
    }
    static async sendMockSMS(to, text) {
        // Write code output to server log
        console.log(`[MOCK SMS] Sent to: ${to} - Content: ${text}`);
        return { success: true, messageId: `mock-${Math.random().toString(36).substring(7)}` };
    }
}
exports.SMSService = SMSService;
