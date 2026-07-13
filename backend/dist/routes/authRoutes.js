"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authGuard_1 = require("../middlewares/authGuard");
const validator_1 = require("../middlewares/validator");
const authValidator_1 = require("../validators/authValidator");
exports.authRouter = (0, express_1.Router)();
// 1. Registration & Verification
exports.authRouter.post('/register/customer', (0, validator_1.validateBody)(authValidator_1.registerCustomerSchema), authController_1.AuthController.registerCustomer);
exports.authRouter.post('/register/fundi', (0, validator_1.validateBody)(authValidator_1.registerFundiSchema), authController_1.AuthController.registerFundi);
exports.authRouter.post('/verify-otp', (0, validator_1.validateBody)(authValidator_1.verifyOtpSchema), authController_1.AuthController.verifyOTP);
exports.authRouter.post('/resend-otp', (0, validator_1.validateBody)(authValidator_1.resendOtpSchema), authController_1.AuthController.resendOTP);
// 2. Authentication Sessions
exports.authRouter.post('/login', (0, validator_1.validateBody)(authValidator_1.loginSchema), authController_1.AuthController.login);
exports.authRouter.post('/logout', authGuard_1.authenticateJWT, authController_1.AuthController.logout);
exports.authRouter.post('/logout-all', authGuard_1.authenticateJWT, authController_1.AuthController.logoutAll);
exports.authRouter.post('/refresh-token', authController_1.AuthController.refreshToken);
exports.authRouter.post('/refresh', authController_1.AuthController.refreshToken);
// 3. Password Management
exports.authRouter.post('/forgot-password', (0, validator_1.validateBody)(authValidator_1.forgotPasswordSchema), authController_1.AuthController.forgotPassword);
exports.authRouter.post('/reset-password', (0, validator_1.validateBody)(authValidator_1.resetPasswordSchema), authController_1.AuthController.resetPassword);
// 4. Session details
exports.authRouter.get('/me', authGuard_1.authenticateJWT, authController_1.AuthController.getMe);
exports.authRouter.get('/sessions', authGuard_1.authenticateJWT, authController_1.AuthController.getSessions);
exports.authRouter.delete('/session/:id', authGuard_1.authenticateJWT, authController_1.AuthController.deleteSession);
