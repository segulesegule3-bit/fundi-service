import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { OTPService } from '../services/otpService';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middlewares/authGuard';
import { BruteForceProtector } from '../middlewares/rateLimiter';

export class AuthController {
  /**
   * Register customer profile
   */
  public static async registerCustomer(req: Request, res: Response): Promise<void> {
    try {
      const user = await AuthService.registerCustomer(req.body);
      res.status(201).json({
        success: true,
        message: 'Customer registration successful. OTP code dispatched.',
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Customer registration failed',
        errors: [error.message],
      });
    }
  }

  /**
   * Register fundi profile
   */
  public static async registerFundi(req: Request, res: Response): Promise<void> {
    try {
      const user = await AuthService.registerFundi(req.body);
      res.status(201).json({
        success: true,
        message: 'Fundi registration successful. Profile is pending admin verification. OTP code dispatched.',
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Fundi registration failed',
        errors: [error.message],
      });
    }
  }

  /**
   * Verify registration OTP code
   */
  public static async verifyOTP(req: Request, res: Response): Promise<void> {
    const { phoneNumber, code, purpose } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'OTP verification failed',
          errors: ['User not found'],
        });
        return;
      }

      const verified = await OTPService.verifyOTP(user.id, code, purpose || 'registration');
      if (!verified) {
        res.status(400).json({
          success: false,
          message: 'OTP verification failed',
          errors: ['Invalid or expired OTP code'],
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'OTP verification successful',
        data: { verified: true },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'OTP verification error',
        errors: [error.message],
      });
    }
  }

  /**
   * Resend verification OTP code
   */
  public static async resendOTP(req: Request, res: Response): Promise<void> {
    const { phoneNumber, purpose } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'OTP resend failed',
          errors: ['User not found'],
        });
        return;
      }

      const code = await OTPService.createOTP(user.id, purpose || 'registration');
      // In production, integrate with SMS gateway
      res.status(200).json({
        success: true,
        message: 'OTP code resent successfully',
        data: { resent: true },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'OTP resend failed',
        errors: [error.message],
      });
    }
  }

  /**
   * Login user
   */
  public static async login(req: Request, res: Response): Promise<void> {
    const ip = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceName = req.body.deviceName || 'Web/Mobile Client';
    const { email, phoneNumber } = req.body;
    const identifier = email || phoneNumber;

    if (!identifier) {
      res.status(400).json({
        success: false,
        message: 'Login failed',
        errors: ['Email or Phone number is required']
      });
      return;
    }

    // Check brute force lockout status
    const lockout = BruteForceProtector.isLockedOut(identifier);
    if (lockout.locked) {
      res.status(401).json({
        success: false,
        message: 'Account locked',
        error: `Too many failed login attempts. Try again in ${lockout.timeLeft} seconds.`,
        errors: [`Account locked out for ${lockout.timeLeft} seconds.`]
      });
      return;
    }

    try {
      const result = await AuthService.login(req.body, { ip, userAgent, deviceName });

      if (!result) {
        const attempts = BruteForceProtector.recordFailure(identifier);
        const remaining = Math.max(0, 5 - attempts);
        res.status(401).json({
          success: false,
          message: 'Authentication failed',
          error: `Attempts remaining: ${remaining}`,
          errors: ['Invalid phone/email or password credentials']
        });
        return;
      }

      BruteForceProtector.recordSuccess(identifier);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          user: {
            id: result.user.id,
            fullName: result.user.fullName,
            email: result.user.email,
            phoneNumber: result.user.phoneNumber,
            role: result.user.role,
          },
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: 'Login failed',
        errors: [error.message],
      });
    }
  }

  /**
   * Logout session
   */
  public static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    const sessionId = req.user?.sessionId;

    if (!sessionId) {
      res.status(400).json({
        success: false,
        message: 'Logout failed',
        errors: ['Active session session identifier not found'],
      });
      return;
    }

    const success = await AuthService.logout(sessionId);
    if (!success) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        errors: ['Could not revoke active session'],
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: { loggedOut: true },
    });
  }

  /**
   * Terminate all active sessions
   */
  public static async logoutAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'Logout all sessions failed',
        errors: ['User not found'],
      });
      return;
    }

    const count = await AuthService.logoutAll(userId);

    res.status(200).json({
      success: true,
      message: `Successfully logged out from all devices (${count} sessions terminated)`,
      data: { terminatedSessions: count },
    });
  }

  /**
   * Rotate refresh token sessions
   */
  public static async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Token rotation failed',
        error: 'Refresh token is required',
        errors: ['Refresh token is required'],
      });
      return;
    }

    const result = await AuthService.refreshSession(refreshToken);

    if (!result) {
      res.status(401).json({
        success: false,
        message: 'Token rotation failed',
        error: 'Invalid, expired, or revoked refresh token session',
        errors: ['Invalid, expired, or revoked refresh token session'],
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Token rotated successfully',
      data: {
        token: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
    });
  }

  /**
   * Retrieve active identity profile details
   */
  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          customerProfile: true,
          fundiProfile: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Profile lookup failed',
          errors: ['User details not found'],
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User profile fetched successfully',
        data: { user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Profile lookup error',
        errors: [error.message],
      });
    }
  }

  /**
   * Retrieve list of active sessions
   */
  public static async getSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    try {
      const sessions = await prisma.loginSession.findMany({
        where: { userId },
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        message: 'Active sessions retrieved successfully',
        data: { sessions },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Sessions lookup error',
        errors: [error.message],
      });
    }
  }

  /**
   * Terminate specific active session
   */
  public static async deleteSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.id;

    try {
      const session = await prisma.loginSession.findUnique({
        where: { id },
      });

      if (!session || session.userId !== userId) {
        res.status(404).json({
          success: false,
          message: 'Session termination failed',
          errors: ['Session not found or unauthorized to terminate'],
        });
        return;
      }

      await prisma.loginSession.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Session terminated successfully',
        data: { terminated: true },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Session deletion error',
        errors: [error.message],
      });
    }
  }

  /**
   * Trigger forgot password OTP verification code
   */
  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email, phoneNumber } = req.body;
    const identifier = email || phoneNumber;

    try {
      const success = await AuthService.requestPasswordReset(identifier);
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Password reset request failed',
          errors: ['User not found matching specified identifier'],
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Password reset OTP code dispatched successfully',
        data: { sent: true },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
        errors: [error.message],
      });
    }
  }

  /**
   * Reset password matching OTP code
   */
  public static async resetPassword(req: Request, res: Response): Promise<void> {
    const { phoneNumber, code, newPassword } = req.body;

    try {
      const success = await AuthService.resetPassword(phoneNumber, code, newPassword);
      if (!success) {
        res.status(400).json({
          success: false,
          message: 'Password reset failed',
          errors: ['Invalid or expired OTP verification code'],
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Password reset successful. All active device sessions rotated.',
        data: { reset: true },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        errors: [error.message],
      });
    }
  }
}
