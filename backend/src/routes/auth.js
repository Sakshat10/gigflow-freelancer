import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
    hashPassword,
    verifyPassword,
    generateToken,
    generateRefreshToken,
    setAuthCookie,
    setRefreshCookie,
    clearAuthCookie,
    getCurrentUser,
    getRefreshToken,
    blacklistToken,
} from "../lib/auth.js";
import { loginLimiter, signupLimiter, checkIPBlock, trackLoginFailure, resetLoginFailures } from "../middleware/rate-limiter.js";
import { securityLogger } from "../lib/security-logger.js";
import { sanitizeEmail } from "../middleware/input-sanitizer.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Helper to get client IP
const getClientIp = (req) => {
    return req.ip || req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
};

// Helper to check if user is blocked
const isUserBlocked = (user) => {
    if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
        return true;
    }
    return false;
};

// Helper to reset login attempts
const resetLoginAttempts = async (userId) => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            loginAttempts: 0,
            lastLoginAttempt: null,
            blockedUntil: null
        }
    });
};

// Helper to increment login attempts and block if needed
const handleFailedLogin = async (user, ip) => {
    const attempts = user.loginAttempts + 1;
    const now = new Date();

    // Block user if 5 or more failed attempts
    let blockedUntil = null;
    if (attempts >= 5) {
        blockedUntil = new Date(now.getTime() + 15 * 60 * 1000); // Block for 15 minutes
        securityLogger.ipBlocked(ip, `${attempts} failed login attempts for ${user.email}`, '15 minutes');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            loginAttempts: attempts,
            lastLoginAttempt: now,
            blockedUntil
        }
    });
};

// POST /api/auth/register
router.post("/register", signupLimiter, async (req, res) => {
    try {
        const { email, password, name, paypalMeUsername } = req.body;
        const ip = getClientIp(req);

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, and name are required" });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        // Sanitize email
        let sanitizedEmail;
        try {
            sanitizedEmail = sanitizeEmail(email);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: sanitizedEmail },
        });

        if (existingUser) {
            return res.status(409).json({ error: "User with this email already exists" });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate email verification token
        const emailVerificationToken = uuidv4();

        // Create user
        const user = await prisma.user.create({
            data: {
                email: sanitizedEmail,
                password: hashedPassword,
                name: name.trim(),
                plan: "free",
                paypalMeUsername: paypalMeUsername?.trim() || null,
                emailVerified: false, // Require email verification
                emailVerificationToken,
            },
        });

        // In production, send verification email here
        // For now, log the token (in production, this would be sent via email)
        console.log(`📧 Email verification token for ${user.email}: ${emailVerificationToken}`);
        console.log(`📧 Verification URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${emailVerificationToken}`);

        // Generate tokens
        const token = generateToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

        // Save refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        // Set auth cookies
        setAuthCookie(res, token);
        setRefreshCookie(res, refreshToken);

        securityLogger.loginSuccess(user.email, ip);

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
                emailVerified: user.emailVerified,
            },
            message: "Registration successful. Please check your email to verify your account."
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/auth/login
router.post("/login", checkIPBlock, loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const ip = getClientIp(req);

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Sanitize email
        let sanitizedEmail;
        try {
            sanitizedEmail = sanitizeEmail(email);
        } catch (error) {
            securityLogger.loginFailure(email, ip, 'Invalid email format');
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: sanitizedEmail },
        });

        if (!user) {
            securityLogger.loginFailure(sanitizedEmail, ip, 'User not found');
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check if user is blocked
        if (isUserBlocked(user)) {
            const minutesLeft = Math.ceil((new Date(user.blockedUntil) - new Date()) / 60000);
            securityLogger.loginFailure(user.email, ip, 'Account temporarily blocked');
            return res.status(403).json({
                error: `Account temporarily blocked due to too many failed login attempts. Please try again in ${minutesLeft} minutes.`
            });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            await handleFailedLogin(user, ip);
            trackLoginFailure(ip); // 🔒 Track IP-level failure
            securityLogger.loginFailure(user.email, ip, 'Invalid password');
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Reset login attempts on successful login
        await resetLoginAttempts(user.id);
        resetLoginFailures(ip); // 🔒 Reset IP-level tracking

        // Generate tokens
        const token = generateToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

        // Save refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        // Set auth cookies
        setAuthCookie(res, token);
        setRefreshCookie(res, refreshToken);

        securityLogger.loginSuccess(user.email, ip);

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/auth/verify-email/:token
router.get("/verify-email/:token", async (req, res) => {
    try {
        const { token } = req.params;

        const user = await prisma.user.findUnique({
            where: { emailVerificationToken: token },
        });

        if (!user) {
            return res.status(404).json({ error: "Invalid or expired verification token" });
        }

        // Mark email as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationToken: null, // Clear token after verification
            },
        });

        return res.json({ message: "Email verified successfully!" });
    } catch (error) {
        console.error("Email verification error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/auth/refresh - Refresh access token
router.post("/refresh", async (req, res) => {
    try {
        const refreshTokenData = getRefreshToken(req);

        if (!refreshTokenData) {
            return res.status(401).json({ error: "No refresh token provided" });
        }

        // Verify refresh token matches stored token
        const user = await prisma.user.findUnique({
            where: { id: refreshTokenData.userId },
        });

        if (!user || user.refreshToken !== req.cookies.refresh_token) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        // Generate new access token
        const newToken = generateToken({ userId: user.id, email: user.email });
        setAuthCookie(res, newToken);

        return res.json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.error("Token refresh error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.userId },
            select: {
                id: true,
                email: true,
                name: true,
                plan: true,
                emailVerified: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json({ user });
    } catch (error) {
        console.error("Get user error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
    try {
        const token = req.cookies?.auth_token;

        // Blacklist the current token
        if (token) {
            blacklistToken(token);
        }

        // Clear refresh token from database
        const currentUser = await getCurrentUser(req);
        if (currentUser) {
            await prisma.user.update({
                where: { id: currentUser.userId },
                data: { refreshToken: null }
            });
        }

        // Clear cookies
        clearAuthCookie(res);

        return res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
