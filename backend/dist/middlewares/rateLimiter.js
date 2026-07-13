"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BruteForceProtector = void 0;
exports.rateLimiter = rateLimiter;
// In-memory stores
const ipRequestStore = new Map();
const loginLockoutStore = new Map();
const REQUEST_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // max 100 requests per IP per minute
const FAILED_LOGIN_LIMIT = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
/**
 * Global IP-based rate limiter middleware
 */
function rateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const now = Date.now();
    let limitInfo = ipRequestStore.get(ip);
    if (!limitInfo || now > limitInfo.resetTime) {
        limitInfo = {
            count: 1,
            resetTime: now + REQUEST_WINDOW_MS
        };
        ipRequestStore.set(ip, limitInfo);
    }
    else {
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
exports.BruteForceProtector = {
    isLockedOut(identifier) {
        const record = loginLockoutStore.get(identifier);
        if (!record)
            return { locked: false, timeLeft: 0 };
        const now = Date.now();
        if (now < record.lockUntil) {
            return { locked: true, timeLeft: Math.ceil((record.lockUntil - now) / 1000) };
        }
        // Lock expired, clean up
        loginLockoutStore.delete(identifier);
        return { locked: false, timeLeft: 0 };
    },
    recordFailure(identifier) {
        const now = Date.now();
        const record = loginLockoutStore.get(identifier) || { attempts: 0, lockUntil: 0 };
        record.attempts++;
        if (record.attempts >= FAILED_LOGIN_LIMIT) {
            record.lockUntil = now + LOCKOUT_DURATION_MS;
        }
        loginLockoutStore.set(identifier, record);
        return record.attempts;
    },
    recordSuccess(identifier) {
        loginLockoutStore.delete(identifier);
    }
};
