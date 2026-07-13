import { Router } from 'express';
import { WalletController } from '../controllers/walletController';
import { authenticateJWT, requireRole } from '../middlewares/authGuard';
import { Role } from '@prisma/client';

export const walletRouter = Router();

walletRouter.get('/balance', authenticateJWT, WalletController.getBalance);
walletRouter.post('/deposit', authenticateJWT, WalletController.deposit);
walletRouter.get('/transactions', authenticateJWT, WalletController.getTransactions);
walletRouter.get('/audit', authenticateJWT, requireRole([Role.ADMIN, Role.SUPER_ADMIN]), WalletController.auditTransactions);

