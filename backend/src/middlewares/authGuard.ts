import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Role;
    fullName: string;
    phone: string;
    sessionId?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'fintech_secure_jwt_access_secret_key';

/**
 * Authentication Middleware: decodes token and verifies session is active in database
 */
export async function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: Role;
      fullName: string;
      phone: string;
      sessionId?: string;
    };

    // Check if user session has been revoked/deleted in database
    if (payload.sessionId) {
      const activeSession = await prisma.loginSession.findUnique({
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
    const user = await prisma.user.findUnique({
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
  } catch (err) {
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
export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

export const customerOnly = requireRole([Role.CUSTOMER]);
export const fundiOnly = requireRole([Role.FUNDI]);
export const adminOnly = requireRole([Role.ADMIN, Role.SUPER_ADMIN]);
export const superAdminOnly = requireRole([Role.SUPER_ADMIN]);
