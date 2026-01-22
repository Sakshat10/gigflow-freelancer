import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getCurrentUser } from "../lib/auth.js";

const router = Router();

// GET /api/invoices - Get all invoices for current user
router.get("/", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const invoices = await prisma.invoice.findMany({
            where: {
                workspace: {
                    userId: currentUser.userId,
                },
            },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        clientEmail: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ invoices });
    } catch (error) {
        console.error("Get all invoices error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
