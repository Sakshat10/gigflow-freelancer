import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import {
    hashPassword,
    verifyPassword,
    generateToken,
    setAuthCookie,
    getCurrentUser,
} from "../lib/auth.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
    try {
        const { email, password, name, paypalMeUsername } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, and name are required" });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ error: "User with this email already exists" });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                plan: "free",
                paypalMeUsername: paypalMeUsername || null,
            },
        });

        // Generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        // Set auth cookie
        setAuthCookie(res, token);

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        // Set auth cookie
        setAuthCookie(res, token);

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
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
router.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    return res.json({ message: "Logged out successfully" });
});

export default router;
