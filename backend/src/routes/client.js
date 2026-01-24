import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { uploadSingle, handleUploadError } from "../lib/upload.js";
import { uploadFile, getSignedUrl } from "../lib/supabase.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET /api/client/:shareToken - Get workspace by share token
router.get("/:shareToken", async (req, res) => {
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

// GET /api/client/:shareToken/files
router.get("/:shareToken/files", async (req, res) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { shareToken: req.params.shareToken },
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        const files = await prisma.file.findMany({
            where: { workspaceId: workspace.id },
            include: {
                comments: {
                    orderBy: { createdAt: "asc" }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ files });
    } catch (error) {
        console.error("Get client files error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/client/:shareToken/files - Upload file (Client)
router.post("/:shareToken/files", uploadSingle, handleUploadError, async (req, res) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { shareToken: req.params.shareToken },
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Upload to Supabase Storage
        const uploadResult = await uploadFile(
            workspace.id,
            req.file.originalname,
            req.file.buffer,
            req.file.mimetype
        );

        if (!uploadResult.success) {
            return res.status(500).json({ error: `Upload failed: ${uploadResult.error}` });
        }

        // Save file metadata to database
        const file = await prisma.file.create({
            data: {
                workspaceId: workspace.id,
                filename: req.file.originalname,
                storagePath: uploadResult.storagePath,
                size: req.file.size,
                uploadedBy: "client",
                fileUrl: uploadResult.storagePath, // For backward compatibility
            },
        });

        return res.status(201).json({ file });
    } catch (error) {
        console.error("Client upload file error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/client/:shareToken/files/:fileId/download - Get signed URL for file download
router.get("/:shareToken/files/:fileId/download", async (req, res) => {
    try {
        const file = await prisma.file.findUnique({
            where: { id: req.params.fileId },
            include: { workspace: true },
        });

        if (!file || file.workspace.shareToken !== req.params.shareToken) {
            return res.status(404).json({ error: "File not found" });
        }

        // Handle legacy files (before Supabase migration)
        if (!file.storagePath) {
            return res.status(410).json({ 
                error: "File no longer available. This file was uploaded before the storage migration." 
            });
        }

        // Generate signed URL (expires in 5 minutes)
        const signedUrlResult = await getSignedUrl(file.storagePath, 300);

        if (!signedUrlResult.success) {
            return res.status(500).json({ error: `Download failed: ${signedUrlResult.error}` });
        }

        return res.json({ 
            downloadUrl: signedUrlResult.signedUrl,
            filename: file.filename,
            expiresIn: 300 // 5 minutes
        });
    } catch (error) {
        console.error("Get client file download URL error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/client/:shareToken/files/:fileId/comments
router.get("/:shareToken/files/:fileId/comments", async (req, res) => {
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
router.post("/:shareToken/files/:fileId/comments", async (req, res) => {
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
router.get("/:shareToken/invoices", async (req, res) => {
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
router.post("/:shareToken/invoices/:invoiceId/pay", async (req, res) => {
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
router.get("/:shareToken/messages", async (req, res) => {
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
router.post("/:shareToken/messages", async (req, res) => {
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
router.get("/:shareToken/todos", async (req, res) => {
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
