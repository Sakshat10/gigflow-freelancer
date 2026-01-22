import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getCurrentUser } from "../lib/auth.js";

const router = Router();

// GET /api/notifications - Get all notifications for current user
router.get("/", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: currentUser.userId },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ notifications });
    } catch (error) {
        console.error("Get notifications error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch("/:id/read", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notification = await prisma.notification.findUnique({
            where: { id: req.params.id },
        });

        if (!notification || notification.userId !== currentUser.userId) {
            return res.status(404).json({ error: "Notification not found" });
        }

        const updated = await prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true },
        });

        return res.json(updated);
    } catch (error) {
        console.error("Mark notification as read error:", error);
        return res.status(500).json({ error: "Failed to update notification" });
    }
});

// DELETE /api/notifications - Clear all notifications
router.delete("/", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await prisma.notification.deleteMany({
            where: { userId: currentUser.userId },
        });

        return res.json({ message: "All notifications cleared" });
    } catch (error) {
        console.error("Clear notifications error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
