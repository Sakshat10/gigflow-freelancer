import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getCurrentUser } from "../lib/auth.js";
import { sendEmail, sendBulkEmails, isEmailConfigured } from "../lib/email.js";

const router = Router();

// GET /api/emails/status - Check if email service is configured
router.get("/status", async (req, res) => {
    return res.json({
        configured: isEmailConfigured(),
        message: isEmailConfigured()
            ? "Email service is ready"
            : "Email service not configured. Please add RESEND_API_KEY to your environment."
    });
});

// POST /api/emails/send - Send email to client(s)
router.post("/send", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { to, clientIds, subject, body, saveToHistory = true } = req.body;

        if (!subject || !body) {
            return res.status(400).json({ error: "Subject and body are required" });
        }

        // Determine recipients
        let recipients = [];

        if (clientIds && clientIds.length > 0) {
            // Get clients by IDs
            const clients = await prisma.client.findMany({
                where: {
                    id: { in: clientIds },
                    userId: currentUser.userId
                }
            });
            recipients = clients.map(c => ({ email: c.email, name: c.name, clientId: c.id }));
        } else if (to) {
            // Direct email address(es)
            const emailsArray = Array.isArray(to) ? to : [to];
            recipients = emailsArray.map(email => ({ email, name: null, clientId: null }));
        } else {
            return res.status(400).json({ error: "Either 'to' or 'clientIds' is required" });
        }

        if (recipients.length === 0) {
            return res.status(400).json({ error: "No valid recipients found" });
        }

        // Get user info for sender name
        const user = await prisma.user.findUnique({
            where: { id: currentUser.userId },
            select: { name: true, company: true }
        });

        const fromName = user?.company || user?.name || "GigFlow";

        // Send emails
        const results = await sendBulkEmails(recipients, subject, body, fromName);

        // Save to history if requested
        if (saveToHistory) {
            const emailRecords = recipients.map(r => ({
                userId: currentUser.userId,
                clientId: r.clientId,
                subject,
                body,
                status: results.errors.some(e => e.includes(r.email)) ? "failed" : "sent"
            }));

            await prisma.email.createMany({
                data: emailRecords
            });
        }

        return res.json({
            success: results.success,
            sent: results.sent,
            failed: results.failed,
            errors: results.errors
        });
    } catch (error) {
        console.error("Send email error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/emails/history - Get sent email history
router.get("/history", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { limit = 50, offset = 0, clientId } = req.query;

        const where = { userId: currentUser.userId };
        if (clientId) {
            where.clientId = clientId;
        }

        const emails = await prisma.email.findMany({
            where,
            orderBy: { sentAt: "desc" },
            take: parseInt(limit),
            skip: parseInt(offset),
            include: {
                client: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        const total = await prisma.email.count({ where });

        return res.json({ emails, total });
    } catch (error) {
        console.error("Get email history error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/emails/templates - List email templates
router.get("/templates", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const templates = await prisma.emailTemplate.findMany({
            where: { userId: currentUser.userId },
            orderBy: { createdAt: "desc" }
        });

        return res.json({ templates });
    } catch (error) {
        console.error("Get templates error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/emails/templates - Create email template
router.post("/templates", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { name, subject, body, type = "custom" } = req.body;

        if (!name || !subject || !body) {
            return res.status(400).json({ error: "Name, subject, and body are required" });
        }

        const template = await prisma.emailTemplate.create({
            data: {
                userId: currentUser.userId,
                name: name.trim(),
                subject: subject.trim(),
                body,
                type
            }
        });

        return res.status(201).json({ template });
    } catch (error) {
        console.error("Create template error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PUT /api/emails/templates/:id - Update email template
router.put("/templates/:id", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { name, subject, body, type } = req.body;

        // Verify template exists and belongs to user
        const existingTemplate = await prisma.emailTemplate.findFirst({
            where: {
                id: req.params.id,
                userId: currentUser.userId
            }
        });

        if (!existingTemplate) {
            return res.status(404).json({ error: "Template not found" });
        }

        const template = await prisma.emailTemplate.update({
            where: { id: req.params.id },
            data: {
                name: name?.trim() || existingTemplate.name,
                subject: subject?.trim() || existingTemplate.subject,
                body: body || existingTemplate.body,
                type: type || existingTemplate.type
            }
        });

        return res.json({ template });
    } catch (error) {
        console.error("Update template error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /api/emails/templates/:id - Delete email template
router.delete("/templates/:id", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Verify template exists and belongs to user
        const existingTemplate = await prisma.emailTemplate.findFirst({
            where: {
                id: req.params.id,
                userId: currentUser.userId
            }
        });

        if (!existingTemplate) {
            return res.status(404).json({ error: "Template not found" });
        }

        await prisma.emailTemplate.delete({
            where: { id: req.params.id }
        });

        return res.json({ success: true, message: "Template deleted" });
    } catch (error) {
        console.error("Delete template error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
