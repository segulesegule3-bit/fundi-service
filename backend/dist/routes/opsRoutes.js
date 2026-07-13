"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opsRouter = void 0;
const express_1 = require("express");
const opsController_1 = require("../controllers/opsController");
const authGuard_1 = require("../middlewares/authGuard");
exports.opsRouter = (0, express_1.Router)();
/**
 * Middleware to enforce RBAC based on the operations sub-role
 */
function requireOpsRole(allowedRoles) {
    return (req, res, next) => {
        // Read sub-role from X-Ops-Role header or map based on DB Role
        const rawRole = req.headers['x-ops-role'];
        const dbRole = req.user?.role;
        let userRole = 'Support Agent'; // Default fallback
        if (rawRole) {
            userRole = rawRole.toString();
        }
        else if (dbRole === 'SUPER_ADMIN') {
            userRole = 'Super Admin';
        }
        else if (dbRole === 'SUPPORT') {
            userRole = 'Support Agent';
        }
        else if (dbRole === 'ADMIN') {
            userRole = 'Operations Manager';
        }
        if (userRole === 'Super Admin') {
            return next(); // Super Admin holds all permissions
        }
        if (allowedRoles.includes(userRole)) {
            return next();
        }
        res.status(403).json({
            success: false,
            message: 'Access Denied: Insufficient operations role permissions',
            errors: [`Your operations role '${userRole}' does not have permission to execute this command.`]
        });
    };
}
// 1. Executive dashboard & Health (Finance Manager, Executive, Operations Manager)
exports.opsRouter.get('/stats', authGuard_1.authenticateJWT, requireOpsRole(['Finance Manager', 'Executive', 'Operations Manager']), opsController_1.OpsController.getExecutiveStats);
exports.opsRouter.get('/health', authGuard_1.authenticateJWT, requireOpsRole(['Operations Manager', 'Executive']), opsController_1.OpsController.getSystemHealth);
// 2. Dispatch monitoring & reassignment (Operations Manager)
exports.opsRouter.get('/dispatch', authGuard_1.authenticateJWT, requireOpsRole(['Operations Manager']), opsController_1.OpsController.getDispatches);
exports.opsRouter.post('/dispatch/reassign', authGuard_1.authenticateJWT, requireOpsRole(['Operations Manager']), opsController_1.OpsController.reassignDispatch);
// 3. Payment operations (Finance Manager)
exports.opsRouter.get('/payments', authGuard_1.authenticateJWT, requireOpsRole(['Finance Manager']), opsController_1.OpsController.getPayments);
// 4. Fraud monitoring (Fraud Analyst)
exports.opsRouter.get('/fraud', authGuard_1.authenticateJWT, requireOpsRole(['Fraud Analyst']), opsController_1.OpsController.getFraudAlerts);
exports.opsRouter.post('/users/:id/suspend', authGuard_1.authenticateJWT, requireOpsRole(['Fraud Analyst']), opsController_1.OpsController.suspendUser);
// 5. Incident control room (Operations Manager, Executive)
exports.opsRouter.get('/incidents', authGuard_1.authenticateJWT, requireOpsRole(['Operations Manager', 'Executive']), opsController_1.OpsController.getIncidents);
exports.opsRouter.post('/incidents', authGuard_1.authenticateJWT, requireOpsRole(['Operations Manager']), opsController_1.OpsController.createIncident);
exports.opsRouter.put('/incidents/:id', authGuard_1.authenticateJWT, requireOpsRole(['Operations Manager']), opsController_1.OpsController.updateIncident);
