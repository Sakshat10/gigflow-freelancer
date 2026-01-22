import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const COOKIE_NAME = "auth_token";

export interface JWTPayload {
    userId: string;
    email: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

// Compare password with hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

// Set JWT cookie (Express version)
export function setAuthCookie(res: Response, token: string): void {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
        path: "/",
    });
}

// Clear JWT cookie (Express version)
export function clearAuthCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

// Get current user from request (Express version)
export async function getCurrentUser(req: Request): Promise<JWTPayload | null> {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;
    return verifyToken(token);
}

// Auth middleware helper
export async function requireAuth(req: Request): Promise<JWTPayload> {
    const user = await getCurrentUser(req);
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}
