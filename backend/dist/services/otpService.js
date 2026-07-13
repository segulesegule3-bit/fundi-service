"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../config/prisma"));
class OTPService {
    /**
     * Generates a secure random 6-digit numeric OTP code
     */
    static generateOTP() {
        const min = 100000;
        const max = 999999;
        return Math.floor(crypto_1.default.randomInt(min, max)).toString();
    }
    /**
     * Hashes the code using SHA-256 for secure database storage
     */
    static hashOTP(code) {
        return crypto_1.default.createHash('sha256').update(code).digest('hex');
    }
    /**
     * Create and store a new OTP in the database
     */
    static async createOTP(userId, purpose) {
        const code = OTPService.generateOTP();
        const codeHash = OTPService.hashOTP(code);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration
        // Invalidate prior pending OTPs for the same user and purpose
        await prisma_1.default.oTPVerification.deleteMany({
            where: { userId, purpose },
        });
        await prisma_1.default.oTPVerification.create({
            data: {
                userId,
                codeHash,
                purpose,
                expiresAt,
            },
        });
        return code;
    }
    /**
     * Verifies an OTP code and deletes it immediately to prevent replay attacks
     */
    static async verifyOTP(userId, code, purpose) {
        const codeHash = OTPService.hashOTP(code);
        const otpRecord = await prisma_1.default.oTPVerification.findFirst({
            where: {
                userId,
                codeHash,
                purpose,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!otpRecord) {
            return false;
        }
        // Delete immediately upon successful verification
        await prisma_1.default.oTPVerification.delete({
            where: { id: otpRecord.id },
        });
        return true;
    }
}
exports.OTPService = OTPService;
