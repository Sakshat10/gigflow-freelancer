import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getCurrentUser } from "../lib/auth.js";

const router = Router();

// GET /api/clients - List all clients for user
router.get("/", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const clients = await prisma.client.findMany({
            where: { userId: currentUser.userId },
            orderBy: { createdAt: "desc" },
            include: {
                emails: {
                    take: 5,
                    orderBy: { sentAt: "desc" }
                }
            }
        });

        return res.json({ clients });
    } catch (error) {
        console.error("Get clients error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/clients/:id - Get single client
router.get("/:id", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const client = await prisma.client.findFirst({
            where: {
                id: req.params.id,
                userId: currentUser.userId
            },
            include: {
                emails: {
                    orderBy: { sentAt: "desc" }
                }
            }
        });

        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }

        return res.json({ client });
    } catch (error) {
        console.error("Get client error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/clients - Create new client
router.post("/", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { name, email, company, status, notes } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required" });
        }

        // Check if client with same email already exists for this user
        const existingClient = await prisma.client.findFirst({
            where: {
                userId: currentUser.userId,
                email: email.toLowerCase().trim()
            }
        });

        if (existingClient) {
            return res.status(409).json({
                error: "A client with this email already exists",
                existingClient
            });
        }

        const client = await prisma.client.create({
            data: {
                userId: currentUser.userId,
                name: name.trim(),
                email: email.toLowerCase().trim(),
                company: company?.trim() || null,
                status: status || "active",
                notes: notes?.trim() || null
            }
        });

        return res.status(201).json({ client });
    } catch (error) {
        console.error("Create client error:", error);
        if (error.code === "P2002") {
            return res.status(409).json({ error: "A client with this email already exists" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PUT /api/clients/:id - Update client
router.put("/:id", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { name, email, company, status, notes } = req.body;

        // Verify client exists and belongs to user
        const existingClient = await prisma.client.findFirst({
            where: {
                id: req.params.id,
                userId: currentUser.userId
            }
        });

        if (!existingClient) {
            return res.status(404).json({ error: "Client not found" });
        }

        // Check if new email is taken by another client
        if (email && email.toLowerCase().trim() !== existingClient.email) {
            const emailTaken = await prisma.client.findFirst({
                where: {
                    userId: currentUser.userId,
                    email: email.toLowerCase().trim(),
                    NOT: { id: req.params.id }
                }
            });

            if (emailTaken) {
                return res.status(409).json({ error: "Another client with this email already exists" });
            }
        }

        const client = await prisma.client.update({
            where: { id: req.params.id },
            data: {
                name: name?.trim() || existingClient.name,
                email: email?.toLowerCase().trim() || existingClient.email,
                company: company !== undefined ? (company?.trim() || null) : existingClient.company,
                status: status || existingClient.status,
                notes: notes !== undefined ? (notes?.trim() || null) : existingClient.notes
            }
        });

        return res.json({ client });
    } catch (error) {
        console.error("Update client error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /api/clients/:id - Delete client
router.delete("/:id", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Verify client exists and belongs to user
        const existingClient = await prisma.client.findFirst({
            where: {
                id: req.params.id,
                userId: currentUser.userId
            }
        });

        if (!existingClient) {
            return res.status(404).json({ error: "Client not found" });
        }

        await prisma.client.delete({
            where: { id: req.params.id }
        });

        return res.json({ success: true, message: "Client deleted" });
    } catch (error) {
        console.error("Delete client error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/clients/import - Import clients from workspaces
router.post("/import", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get all workspaces with client emails
        const workspaces = await prisma.workspace.findMany({
            where: {
                userId: currentUser.userId,
                clientEmail: { not: null }
            },
            select: {
                id: true,
                name: true,
                clientEmail: true
            }
        });

        const imported = [];
        const skipped = [];

        for (const workspace of workspaces) {
            if (!workspace.clientEmail) continue;

            try {
                const client = await prisma.client.create({
                    data: {
                        userId: currentUser.userId,
                        name: workspace.name, // Use workspace name as client name
                        email: workspace.clientEmail.toLowerCase().trim(),
                        status: "active",
                        notes: `Imported from workspace: ${workspace.name}`
                    }
                });
                imported.push(client);
            } catch (err) {
                // Skip if already exists
                if (err.code === "P2002") {
                    skipped.push({
                        email: workspace.clientEmail,
                        reason: "Already exists"
                    });
                } else {
                    skipped.push({
                        email: workspace.clientEmail,
                        reason: err.message
                    });
                }
            }
        }

        return res.json({
            success: true,
            imported: imported.length,
            skipped: skipped.length,
            clients: imported,
            skippedDetails: skipped
        });
    } catch (error) {
        console.error("Import clients error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
