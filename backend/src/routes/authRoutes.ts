import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authGuard';
import { validateBody } from '../middlewares/validator';
import {
  registerCustomerSchema,
  registerFundiSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/authValidator';

export const authRouter = Router();

// 1. Registration & Verification
authRouter.post('/register/customer', validateBody(registerCustomerSchema), AuthController.registerCustomer);
authRouter.post('/register/fundi', validateBody(registerFundiSchema), AuthController.registerFundi);
authRouter.post('/verify-otp', validateBody(verifyOtpSchema), AuthController.verifyOTP);
authRouter.post('/resend-otp', validateBody(resendOtpSchema), AuthController.resendOTP);

// 2. Authentication Sessions
authRouter.post('/login', validateBody(loginSchema), AuthController.login);
authRouter.post('/logout', authenticateJWT, AuthController.logout);
authRouter.post('/logout-all', authenticateJWT, AuthController.logoutAll);
authRouter.post('/refresh-token', AuthController.refreshToken);
authRouter.post('/refresh', AuthController.refreshToken);

// 3. Password Management
authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), AuthController.forgotPassword);
authRouter.post('/reset-password', validateBody(resetPasswordSchema), AuthController.resetPassword);

// 4. Session details
authRouter.get('/me', authenticateJWT, AuthController.getMe);
authRouter.get('/sessions', authenticateJWT, AuthController.getSessions);
authRouter.delete('/session/:id', authenticateJWT, AuthController.deleteSession);
