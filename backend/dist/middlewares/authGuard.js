"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminOnly = exports.adminOnly = exports.fundiOnly = exports.customerOnly = void 0;
exports.authenticateJWT = authenticateJWT;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const JWT_SECRET = process.env.JWT_SECRET || 'fintech_secure_jwt_access_secret_key';
/**
 * Authentication Middleware: decodes token and verifies session is active in database
 */
async function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Access Denied: Missing Bearer Token',
            errors: ['No authorization token provided']
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Check if user session has been revoked/deleted in database
        if (payload.sessionId) {
            const activeSession = await prisma_1.default.loginSession.findUnique({
                where: { id: payload.sessionId },
            });
            if (!activeSession || activeSession.expiresAt < new Date()) {
                res.status(401).json({
                    success: false,
                    message: 'Access Denied: Revoked or Expired session session',
                    errors: ['Session has been invalidated or expired']
                });
                return;
            }
        }
        // Verify user is still active
        const user = await prisma_1.default.user.findUnique({
            where: { id: payload.id },
        });
        if (!user || !user.isActive) {
            res.status(403).json({
                success: false,
                message: 'Access Denied: User account is inactive or suspended',
                errors: ['User account is currently disabled']
            });
            return;
        }
        req.user = payload;
        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            message: 'Access Denied: Invalid Access Token',
            errors: ['JWT token verification failed']
        });
    }
}
/**
 * RBAC Authorization Middleware: verifies user holds correct permissions
 */
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Access Denied: Unauthenticated request',
                errors: ['Authentication is required']
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Access Denied: Insufficient permissions',
                errors: [`Your role '${req.user.role}' is not authorized to access this resource`]
            });
            return;
        }
        next();
    };
}
exports.customerOnly = requireRole([client_1.Role.CUSTOMER]);
exports.fundiOnly = requireRole([client_1.Role.FUNDI]);
exports.adminOnly = requireRole([client_1.Role.ADMIN, client_1.Role.SUPER_ADMIN]);
exports.superAdminOnly = requireRole([client_1.Role.SUPER_ADMIN]);
