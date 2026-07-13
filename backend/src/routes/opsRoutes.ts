import { Router } from 'express';
import { OpsController } from '../controllers/opsController';
import { authenticateJWT } from '../middlewares/authGuard';

export const opsRouter = Router();

/**
 * Middleware to enforce RBAC based on the operations sub-role
 */
function requireOpsRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    // Read sub-role from X-Ops-Role header or map based on DB Role
    const rawRole = req.headers['x-ops-role'];
    const dbRole = req.user?.role;
    
    let userRole = 'Support Agent'; // Default fallback
    if (rawRole) {
      userRole = rawRole.toString();
    } else if (dbRole === 'SUPER_ADMIN') {
      userRole = 'Super Admin';
    } else if (dbRole === 'SUPPORT') {
      userRole = 'Support Agent';
    } else if (dbRole === 'ADMIN') {
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
opsRouter.get('/stats', authenticateJWT, requireOpsRole(['Finance Manager', 'Executive', 'Operations Manager']), OpsController.getExecutiveStats);
opsRouter.get('/health', authenticateJWT, requireOpsRole(['Operations Manager', 'Executive']), OpsController.getSystemHealth);

// 2. Dispatch monitoring & reassignment (Operations Manager)
opsRouter.get('/dispatch', authenticateJWT, requireOpsRole(['Operations Manager']), OpsController.getDispatches);
opsRouter.post('/dispatch/reassign', authenticateJWT, requireOpsRole(['Operations Manager']), OpsController.reassignDispatch);

// 3. Payment operations (Finance Manager)
opsRouter.get('/payments', authenticateJWT, requireOpsRole(['Finance Manager']), OpsController.getPayments);

// 4. Fraud monitoring (Fraud Analyst)
opsRouter.get('/fraud', authenticateJWT, requireOpsRole(['Fraud Analyst']), OpsController.getFraudAlerts);
opsRouter.post('/users/:id/suspend', authenticateJWT, requireOpsRole(['Fraud Analyst']), OpsController.suspendUser);

// 5. Incident control room (Operations Manager, Executive)
opsRouter.get('/incidents', authenticateJWT, requireOpsRole(['Operations Manager', 'Executive']), OpsController.getIncidents);
opsRouter.post('/incidents', authenticateJWT, requireOpsRole(['Operations Manager']), OpsController.createIncident);
opsRouter.put('/incidents/:id', authenticateJWT, requireOpsRole(['Operations Manager']), OpsController.updateIncident);
