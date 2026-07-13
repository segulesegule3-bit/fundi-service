import crypto from 'crypto';
import prisma from '../config/prisma';

export class OTPService {
  /**
   * Generates a secure random 6-digit numeric OTP code
   */
  public static generateOTP(): string {
    const min = 100000;
    const max = 999999;
    return Math.floor(crypto.randomInt(min, max)).toString();
  }

  /**
   * Hashes the code using SHA-256 for secure database storage
   */
  public static hashOTP(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Create and store a new OTP in the database
   */
  public static async createOTP(userId: string, purpose: string): Promise<string> {
    const code = OTPService.generateOTP();
    const codeHash = OTPService.hashOTP(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Invalidate prior pending OTPs for the same user and purpose
    await prisma.oTPVerification.deleteMany({
      where: { userId, purpose },
    });

    await prisma.oTPVerification.create({
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
  public static async verifyOTP(userId: string, code: string, purpose: string): Promise<boolean> {
    const codeHash = OTPService.hashOTP(code);

    const otpRecord = await prisma.oTPVerification.findFirst({
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
    await prisma.oTPVerification.delete({
      where: { id: otpRecord.id },
    });

    return true;
  }
}
