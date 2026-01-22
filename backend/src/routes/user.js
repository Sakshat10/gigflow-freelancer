import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import {
    hashPassword,
    getCurrentUser,
    requireAuth,
} from "../lib/auth.js";

const router = Router();

// GET /api/user/me - Get current user profile
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
                company: true,
                plan: true,
                createdAt: true,
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

// PATCH /api/user/me - Update user profile
router.patch("/me", async (req: Request, res: Response) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { name, email, company } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Name is required" });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email.trim(),
                NOT: { id: currentUser.userId },
            },
        });

        if (existingUser) {
            return res.status(400).json({ error: "Email is already in use" });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: currentUser.userId },
            data: {
                name: name.trim(),
                email: email.trim(),
                company: company?.trim() || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                company: true,
                plan: true,
                createdAt: true,
            },
        });

        return res.json({ user: updatedUser });
    } catch (error) {
        console.error("Update user error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /api/user/password - Change password
router.patch("/password", async (req: Request, res: Response) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "New password must be at least 6 characters" });
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: currentUser.userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify current password
        const bcrypt = await import("bcryptjs");
        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id: currentUser.userId },
            data: { password: hashedPassword },
        });

        return res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/user/paypal - Get PayPal username
router.get("/paypal", async (req: Request, res: Response) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.userId },
            select: { paypalMeUsername: true },
        });

        return res.json({ paypalMeUsername: user?.paypalMeUsername || null });
    } catch (error) {
        console.error("Get PayPal username error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /api/user/paypal - Update PayPal username
router.patch("/paypal", async (req: Request, res: Response) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { paypalMeUsername } = req.body;

        await prisma.user.update({
            where: { id: currentUser.userId },
            data: { paypalMeUsername: paypalMeUsername || null },
        });

        return res.json({ message: "PayPal username updated successfully" });
    } catch (error) {
        console.error("Update PayPal username error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /api/user/plan - Update subscription plan
router.patch("/plan", async (req: Request, res: Response) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { plan } = req.body;

        if (!plan || !["free", "pro"].includes(plan)) {
            return res.status(400).json({ error: "Invalid plan" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.userId },
            data: { plan },
            select: {
                id: true,
                email: true,
                name: true,
                plan: true,
            },
        });

        return res.json({ user: updatedUser });
    } catch (error) {
        console.error("Update plan error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
