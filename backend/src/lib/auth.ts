import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const COOKIE_NAME = "gigflow_token";

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

// Set JWT cookie (for responses)
export function setAuthCookie(response: NextResponse, token: string): void {
    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });
}

// Clear JWT cookie (for logout)
export function clearAuthCookie(response: NextResponse): void {
    response.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
}

// Get current user from request
export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
}

// Auth middleware helper - returns user or throws
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
    const user = await getCurrentUser(request);
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}

// Create unauthorized response
export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
    return NextResponse.json({ error: message }, { status: 401 });
}

// Create forbidden response
export function forbiddenResponse(message = "Forbidden"): NextResponse {
    return NextResponse.json({ error: message }, { status: 403 });
}

// Create success response
export function successResponse<T>(data: T, status = 200): NextResponse {
    return NextResponse.json(data, { status });
}

// Create error response
export function errorResponse(message: string, status = 400): NextResponse {
    return NextResponse.json({ error: message }, { status });
}
