import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory stores
const ipRequestStore = new Map<string, RateLimitInfo>();
const loginLockoutStore = new Map<string, { attempts: number; lockUntil: number }>();

const REQUEST_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // max 100 requests per IP per minute

const FAILED_LOGIN_LIMIT = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Global IP-based rate limiter middleware
 */
export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.headers['x-forwarded-for'] as string || '127.0.0.1';
  const now = Date.now();

  let limitInfo = ipRequestStore.get(ip);

  if (!limitInfo || now > limitInfo.resetTime) {
    limitInfo = {
      count: 1,
      resetTime: now + REQUEST_WINDOW_MS
    };
    ipRequestStore.set(ip, limitInfo);
  } else {
    limitInfo.count++;
  }

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - limitInfo.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(limitInfo.resetTime / 1000));

  if (limitInfo.count > MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: 'Too many requests. Please try again after 1 minute.',
      retryAfter: Math.ceil((limitInfo.resetTime - now) / 1000)
    });
    return;
  }

  next();
}

/**
 * Brute-force protection helper functions for Login endpoint
 */
export const BruteForceProtector = {
  isLockedOut(identifier: string): { locked: boolean; timeLeft: number } {
    const record = loginLockoutStore.get(identifier);
    if (!record) return { locked: false, timeLeft: 0 };

    const now = Date.now();
    if (now < record.lockUntil) {
      return { locked: true, timeLeft: Math.ceil((record.lockUntil - now) / 1000) };
    }

    // Lock expired, clean up
    loginLockoutStore.delete(identifier);
    return { locked: false, timeLeft: 0 };
  },

  recordFailure(identifier: string): number {
    const now = Date.now();
    const record = loginLockoutStore.get(identifier) || { attempts: 0, lockUntil: 0 };

    record.attempts++;
    if (record.attempts >= FAILED_LOGIN_LIMIT) {
      record.lockUntil = now + LOCKOUT_DURATION_MS;
    }

    loginLockoutStore.set(identifier, record);
    return record.attempts;
  },

  recordSuccess(identifier: string): void {
    loginLockoutStore.delete(identifier);
  }
};
