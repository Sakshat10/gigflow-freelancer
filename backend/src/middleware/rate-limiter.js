import rateLimit from 'express-rate-limit';
import { securityLogger } from '../lib/security-logger.js';

// Helper to get client IP
const getClientIp = (req) => {
    return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

// 🔒 IP Blocking for repeated failures
const blockedIPs = new Map(); // Map<ip, { blockedUntil: Date, failCount: number }>
const MAX_FAILURES_BEFORE_BLOCK = 10;
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Track login failure
export const trackLoginFailure = (ip) => {
    const record = blockedIPs.get(ip) || { failCount: 0, blockedUntil: null };
    record.failCount++;

    if (record.failCount >= MAX_FAILURES_BEFORE_BLOCK) {
        record.blockedUntil = new Date(Date.now() + BLOCK_DURATION_MS);
        securityLogger.ipBlocked(ip, 'Too many login failures', '30 minutes');
    }

    blockedIPs.set(ip, record);

    // Clean up old entries after 1 hour
    setTimeout(() => {
        const currentRecord = blockedIPs.get(ip);
        if (currentRecord && (!currentRecord.blockedUntil || currentRecord.blockedUntil < new Date())) {
            blockedIPs.delete(ip);
        }
    }, 60 * 60 * 1000);
};

// Reset failure count on successful login
export const resetLoginFailures = (ip) => {
    blockedIPs.delete(ip);
};

// Check if IP is blocked
export const isIPBlocked = (ip) => {
    const record = blockedIPs.get(ip);
    if (!record || !record.blockedUntil) return false;

    if (record.blockedUntil > new Date()) {
        return true;
    }

    // Block expired, reset
    blockedIPs.delete(ip);
    return false;
};

// Middleware to check IP block
export const checkIPBlock = (req, res, next) => {
    const ip = getClientIp(req);

    if (isIPBlocked(ip)) {
        securityLogger.suspiciousActivity(null, 'Blocked IP attempted access', ip, { endpoint: req.path });
        return res.status(403).json({
            error: 'Your IP has been temporarily blocked due to too many failed attempts. Please try again later.',
            code: 'IP_BLOCKED'
        });
    }

    next();
};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req, res) => {
    const ip = getClientIp(req);
    securityLogger.rateLimitExceeded(ip, req.path, 'Rate limit exceeded');

    res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: req.rateLimit?.resetTime
    });
};

// ⚠️ PRODUCTION NOTE: For multi-instance deployments, replace the default
// in-memory store with Redis: npm install rate-limit-redis
// Example: store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) })

// Global rate limiter - 300 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
});

// Login rate limiter - 5 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    handler: rateLimitHandler
});

// Signup rate limiter - 3 attempts per 30 minutes per IP
export const signupLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3,
    message: 'Too many signup attempts. Please try again in 30 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
});

// File upload rate limiter - 20 uploads per hour per IP
export const fileUploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: 'Too many file uploads. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    // Use user ID if authenticated, otherwise IP
    keyGenerator: (req) => {
        return req.user?.userId || getClientIp(req);
    }
});

// Invoice creation rate limiter - 10 invoices per hour per user
export const invoiceCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many invoices created. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    keyGenerator: (req) => {
        return req.user?.userId || getClientIp(req);
    }
});

// Email sending rate limiter - 5 emails per hour per user
export const emailSendingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many emails sent. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    keyGenerator: (req) => {
        return req.user?.userId || getClientIp(req);
    }
});

// Chat message rate limiter - 30 messages per minute per user
export const chatMessageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: 'Too many messages. Please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    keyGenerator: (req) => {
        return req.user?.userId || getClientIp(req);
    }
});

// Middleware to attach user to request for rate limiting
export const attachUserToRequest = async (req, res, next) => {
    try {
        // Import getCurrentUser dynamically to avoid circular dependency
        const { getCurrentUser } = await import('../lib/auth.js');
        const user = await getCurrentUser(req);
        if (user) {
            req.user = user;
        }
    } catch (error) {
        // Silently fail - rate limiting will use IP instead
    }
    next();
};

// Client share-token route limiter - 60 requests per 15 minutes per IP
export const clientRouteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60,
    message: 'Too many requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
});
