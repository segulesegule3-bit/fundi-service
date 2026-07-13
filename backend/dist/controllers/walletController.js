"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const walletService_1 = require("../services/walletService");
const prisma_1 = __importDefault(require("../config/prisma"));
class WalletController {
    /**
     * Get authenticated user's wallet details and balance
     */
    static async getBalance(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized: User not logged in',
                errors: ['Session user identifier not found']
            });
            return;
        }
        try {
            let wallet = await prisma_1.default.wallet.findUnique({
                where: { userId },
            });
            if (!wallet) {
                wallet = await prisma_1.default.wallet.create({
                    data: { userId, balance: 0 },
                });
            }
            res.status(200).json({
                success: true,
                message: 'Wallet details retrieved successfully',
                data: {
                    balance: wallet.balance,
                    currency: wallet.currency,
                    updatedAt: wallet.updatedAt,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Wallet balance retrieval failed',
                errors: [error.message],
            });
        }
    }
    /**
     * Deposit money into wallet via simulated API
     */
    static async deposit(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized: User not logged in',
                errors: ['Session user identifier not found']
            });
            return;
        }
        const { amount, referenceId } = req.body;
        if (!amount || amount <= 0) {
            res.status(400).json({
                success: false,
                message: 'Deposit failed',
                errors: ['Deposit amount must be greater than zero'],
            });
            return;
        }
        try {
            const result = await walletService_1.WalletService.deposit(userId, amount, referenceId || `dep_${Date.now()}`);
            res.status(200).json({
                success: true,
                message: 'Wallet deposit completed successfully',
                data: {
                    newBalance: result.wallet.balance,
                    transaction: result.transaction,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Wallet deposit failed',
                errors: [error.message],
            });
        }
    }
    /**
     * Get transaction history for current user
     */
    static async getTransactions(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized: User not logged in',
                errors: ['Session user identifier not found']
            });
            return;
        }
        try {
            const wallet = await prisma_1.default.wallet.findUnique({
                where: { userId },
            });
            if (!wallet) {
                res.status(200).json({
                    success: true,
                    message: 'No transactions found',
                    data: { transactions: [] },
                });
                return;
            }
            const transactions = await prisma_1.default.walletTransaction.findMany({
                where: { walletId: wallet.id },
                orderBy: { createdAt: 'desc' },
            });
            res.status(200).json({
                success: true,
                message: 'Wallet transactions retrieved successfully',
                data: { transactions },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Transactions retrieval failed',
                errors: [error.message],
            });
        }
    }
    /**
     * Audit all database wallet transactions for tamper detection (ADMIN/SUPER_ADMIN only)
     */
    static async auditTransactions(req, res) {
        try {
            const transactions = await prisma_1.default.walletTransaction.findMany({
                orderBy: { createdAt: 'asc' },
            });
            const tamperedTransactions = [];
            const { FinancialHelper } = require('../helpers/financialHelper');
            for (const tx of transactions) {
                if (!tx.signature) {
                    tamperedTransactions.push({
                        id: tx.id,
                        walletId: tx.walletId,
                        amount: tx.amount,
                        type: tx.type,
                        referenceId: tx.referenceId,
                        issue: 'Missing signature signature'
                    });
                    continue;
                }
                const isValid = FinancialHelper.verifySignature(tx.walletId, tx.amount.toString(), tx.type, tx.referenceId, tx.signature);
                if (!isValid) {
                    tamperedTransactions.push({
                        id: tx.id,
                        walletId: tx.walletId,
                        amount: tx.amount,
                        type: tx.type,
                        referenceId: tx.referenceId,
                        signature: tx.signature,
                        issue: 'Invalid signature signature'
                    });
                }
            }
            res.status(200).json({
                success: true,
                message: tamperedTransactions.length === 0
                    ? 'Fintech Ledger Audit Completed: 100% integrity check passed'
                    : 'Ledger Audit Warning: Tampered transaction records detected',
                data: {
                    totalChecked: transactions.length,
                    tamperedCount: tamperedTransactions.length,
                    tamperedRecords: tamperedTransactions,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Financial ledger audit execution failed',
                errors: [error.message],
            });
        }
    }
}
exports.WalletController = WalletController;
