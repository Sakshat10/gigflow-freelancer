import jwt from "jsonwebtoken";
import argon2 from "argon2";

// Fail-fast in production if secrets are missing
const isProduction = process.env.NODE_ENV === "production";
if (isProduction && !process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET must be set in production environment");
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "fallback-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + "-refresh" : "fallback-refresh-key");
const COOKIE_NAME = "auth_token";
const REFRESH_COOKIE_NAME = "refresh_token";

// Token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();

// Hash password using argon2
export async function hashPassword(password) {
    return argon2.hash(password, {
        type: argon2.argon2id, // Recommended type
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4
    });
}

// Compare password with hash using argon2
export async function verifyPassword(password, hash) {
    try {
        return await argon2.verify(hash, password);
    } catch (error) {
        return false;
    }
}

// Generate JWT access token (7 days)
export function generateToken(payload) {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "7d" });
}

// Generate JWT refresh token (30 days)
export function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "30d" });
}

// Verify JWT access token
export function verifyToken(token) {
    try {
        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return null;
        }
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch {
        return null;
    }
}

// Verify JWT refresh token
export function verifyRefreshToken(token) {
    try {
        if (tokenBlacklist.has(token)) {
            return null;
        }
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch {
        return null;
    }
}

// Blacklist a token (for logout)
export function blacklistToken(token) {
    tokenBlacklist.add(token);

    // Clean up blacklist after token expiry (7 days)
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 7 * 24 * 60 * 60 * 1000);
}

// Set JWT cookie with strict security settings
export function setAuthCookie(res, token) {
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: isProduction ? "strict" : "lax", // Strict in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
    });
}

// Set refresh token cookie
export function setRefreshCookie(res, refreshToken) {
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/api/auth/refresh",
    });
}

// Clear JWT cookies
export function clearAuthCookie(res) {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        path: "/",
    });

    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        path: "/api/auth/refresh",
    });
}

// Get current user from request
export async function getCurrentUser(req) {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;
    return verifyToken(token);
}

// Get refresh token from request
export function getRefreshToken(req) {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) return null;
    return verifyRefreshToken(token);
}

// Auth middleware helper
export async function requireAuth(req) {
    const user = await getCurrentUser(req);
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}
