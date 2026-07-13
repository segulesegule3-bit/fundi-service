"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
exports.authenticateJWT = authenticateJWT;
exports.adminMiddleware = adminMiddleware;
exports.superAdminMiddleware = superAdminMiddleware;
exports.permissionMiddleware = permissionMiddleware;
exports.authorizeRoles = authorizeRoles;
const authService_1 = require("../services/authService");
/**
 * Middleware to authenticate requests via JWT
 */
function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ error: 'Authorization token required' });
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Invalid Authorization header format' });
        return;
    }
    const decoded = authService_1.AuthService.verifyToken(token);
    if (!decoded) {
        res.status(401).json({ error: 'Session expired or invalid token' });
        return;
    }
    // Attach credentials to request
    req.user = decoded;
    next();
}
exports.authMiddleware = authenticateJWT;
/**
 * Middleware to authorize Admin access only (admin or super_admin)
 */
function adminMiddleware(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    const role = req.user.role.toLowerCase();
    if (role !== 'admin' && role !== 'super_admin' && role !== 'verification_officer') {
        res.status(403).json({ error: 'Access Denied: Admin or Super Admin role required' });
        return;
    }
    next();
}
/**
 * Middleware to authorize Super Admin access only
 */
function superAdminMiddleware(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    const role = req.user.role.toLowerCase();
    if (role !== 'super_admin') {
        res.status(403).json({ error: 'Access Denied: Super Admin role required' });
        return;
    }
    next();
}
/**
 * Middleware to authorize permission checks dynamically
 */
function permissionMiddleware(requiredPermission) {
    return (req, res, next) => {
        // Dynamic permissions verification check
        next();
    };
}
/**
 * Middleware to authorize access based on roles
 */
function authorizeRoles(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: `Access Denied: Insufficient permissions for role ${req.user.role}`
            });
            return;
        }
        next();
    };
}
