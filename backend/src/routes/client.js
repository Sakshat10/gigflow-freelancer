import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/client/:shareToken - Get workspace by share token
router.get("/:shareToken", async (req: Request, res: Response) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { shareToken: req.params.shareToken },
            include: {
                files: true,
                todos: true,
                messages: true,
                invoices: true,
            },
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        return res.json({ workspace });
    } catch (error) {
        console.error("Get client workspace error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/client/:shareToken/files/:fileId/comments
router.get("/:shareToken/files/:fileId/comments", async (req: Request, res: Response) => {
    try {
        const file = await prisma.file.findUnique({
            where: { id: req.params.fileId },
            include: {
                workspace: true,
                comments: true,
            },
        });

        if (!file || file.workspace.shareToken !== req.params.shareToken) {
            return res.status(404).json({ error: "File not found" });
        }

        return res.json({ comments: file.comments });
    } catch (error) {
        console.error("Get file comments error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/client/:shareToken/files/:fileId/comments
router.post("/:shareToken/files/:fileId/comments", async (req: Request, res: Response) => {
    try {
        const file = await prisma.file.findUnique({
            where: { id: req.params.fileId },
            include: { workspace: true },
        });

        if (!file || file.workspace.shareToken !== req.params.shareToken) {
            return res.status(404).json({ error: "File not found" });
        }

        const { text } = req.body;

        const comment = await prisma.fileComment.create({
            data: {
                fileId: req.params.fileId,
                text,
                sender: "client",
            },
        });

        return res.status(201).json({ comment });
    } catch (error) {
        console.error("Create file comment error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/client/:shareToken/invoices
router.get("/:shareToken/invoices", async (req: Request, res: Response) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { shareToken: req.params.shareToken },
            include: { invoices: true },
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        return res.json({ invoices: workspace.invoices });
    } catch (error) {
        console.error("Get client invoices error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/client/:shareToken/invoices/:invoiceId/pay
router.post("/:shareToken/invoices/:invoiceId/pay", async (req: Request, res: Response) => {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: req.params.invoiceId },
            include: { workspace: true },
        });

        if (!invoice || invoice.workspace.shareToken !== req.params.shareToken) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        // Mark invoice as paid
        const updated = await prisma.invoice.update({
            where: { id: req.params.invoiceId },
            data: { status: "paid" },
        });

        return res.json({ invoice: updated });
    } catch (error) {
        console.error("Pay invoice error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/client/:shareToken/messages
router.get("/:shareToken/messages", async (req: Request, res: Response) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { shareToken: req.params.shareToken },
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        const messages = await prisma.message.findMany({
            where: { workspaceId: workspace.id },
            orderBy: { createdAt: "asc" },
        });

        return res.json({ messages });
    } catch (error) {
        console.error("Get client messages error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/client/:shareToken/messages
router.post("/:shareToken/messages", async (req: Request, res: Response) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { shareToken: req.params.shareToken },
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        const { text } = req.body;

        const message = await prisma.message.create({
            data: {
                workspaceId: workspace.id,
                text,
                sender: "client",
            },
        });

        return res.status(201).json({ message });
    } catch (error) {
        console.error("Create client message error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/client/:shareToken/todos
router.get("/:shareToken/todos", async (req: Request, res: Response) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { shareToken: req.params.shareToken },
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        const todos = await prisma.todo.findMany({
            where: { workspaceId: workspace.id },
            orderBy: { createdAt: "asc" },
        });

        return res.json({ todos });
    } catch (error) {
        console.error("Get client todos error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
