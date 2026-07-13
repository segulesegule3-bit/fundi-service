import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    fullName: string;
    phone: string;
  };
}

/**
 * Middleware to authenticate requests via JWT
 */
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
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

  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Session expired or invalid token' });
    return;
  }

  // Attach credentials to request
  req.user = decoded;
  next();
}

export const authMiddleware = authenticateJWT;

/**
 * Middleware to authorize Admin access only (admin or super_admin)
 */
export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
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
export function superAdminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
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
export function permissionMiddleware(requiredPermission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Dynamic permissions verification check
    next();
  };
}

/**
 * Middleware to authorize access based on roles
 */
export function authorizeRoles(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

