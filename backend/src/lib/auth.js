import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
;

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const COOKIE_NAME = "auth_token";

export interface JWTPayload {
    userId;
    email;
}

// Hash password
export async function hashPassword(password): Promise {
    return bcrypt.hash(password, 12);
}

// Compare password with hash
export async function verifyPassword(password, hash): Promise {
    return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

// Set JWT cookie (Express version with cross-origin support)
export function setAuthCookie(res: Response, token) {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: true, // Required for cross-origin (HTTPS)
        sameSite: "none", // Required for cross-origin
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
        path: "/",
    });
}

// Clear JWT cookie (Express version)
export function clearAuthCookie(res: Response) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    });
}

// Get current user from request (Express version)
export async function getCurrentUser(req: Request): Promise {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;
    return verifyToken(token);
}

// Auth middleware helper
export async function requireAuth(req: Request): Promise {
    const user = await getCurrentUser(req);
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}
