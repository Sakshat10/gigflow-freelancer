import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getCurrentUser } from "../lib/auth.js";
import { v4 as uuidv4 } from "uuid";
import { uploadSingle, handleUploadError } from "../lib/upload.js";
import { uploadFile, getSignedUrl, deleteFile } from "../lib/supabase.js";

const router = Router();

// GET /api/workspaces - List all workspaces for current user
router.get("/", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspaces = await prisma.workspace.findMany({
            where: { userId: currentUser.userId },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ workspaces });
    } catch (error) {
        console.error("Get workspaces error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/workspaces - Create new workspace
router.post("/", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { name, description, clientEmail, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Workspace name is required" });
        }

        const workspace = await prisma.workspace.create({
            data: {
                userId: currentUser.userId,
                name: name.trim(),
                description: description?.trim() || null,
                clientEmail: clientEmail?.trim() || null,
                color: color || "blue",
                shareToken: uuidv4(),
            },
        });

        return res.status(201).json({ workspace });
    } catch (error) {
        console.error("Create workspace error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/workspaces/:id - Get specific workspace
router.get("/:id", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
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

        if (workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        return res.json({ workspace });
    } catch (error) {
        console.error("Get workspace error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /api/workspaces/:id - Update workspace
router.patch("/:id", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        if (workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { name, description, clientEmail, color } = req.body;

        const updated = await prisma.workspace.update({
            where: { id: req.params.id },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() || null }),
                ...(clientEmail !== undefined && { clientEmail: clientEmail?.trim() || null }),
                ...(color !== undefined && { color }),
            },
        });

        return res.json({ workspace: updated });
    } catch (error) {
        console.error("Update workspace error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /api/workspaces/:id - Delete workspace
router.delete("/:id", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        if (workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.workspace.delete({
            where: { id: req.params.id },
        });

        return res.json({ message: "Workspace deleted successfully" });
    } catch (error) {
        console.error("Delete workspace error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// ===== FILES =====

// GET /api/workspaces/:id/files
router.get("/:id/files", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
        });

        if (!workspace || workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const files = await prisma.file.findMany({
            where: { workspaceId: req.params.id },
            include: {
                comments: {
                    orderBy: { createdAt: "asc" }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ files });
    } catch (error) {
        console.error("Get files error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/workspaces/:id/files - Upload file (Freelancer)
router.post("/:id/files", uploadSingle, handleUploadError, async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
        });

        if (!workspace || workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
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
                workspaceId: req.params.id,
                filename: req.file.originalname,
                storagePath: uploadResult.storagePath,
                size: req.file.size,
                uploadedBy: "freelancer",
                fileUrl: uploadResult.storagePath, // For backward compatibility
            },
        });

        return res.status(201).json({ file });
    } catch (error) {
        console.error("Upload file error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/workspaces/:id/files/:fileId/download - Get signed URL for file download
router.get("/:id/files/:fileId/download", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const file = await prisma.file.findUnique({
            where: { id: req.params.fileId },
            include: { workspace: true },
        });

        if (!file || file.workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
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
        console.error("Get file download URL error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /api/workspaces/:id/files/:fileId - Delete file (Freelancer only)
router.delete("/:id/files/:fileId", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const file = await prisma.file.findUnique({
            where: { id: req.params.fileId },
            include: { workspace: true },
        });

        if (!file || file.workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        // Delete from Supabase Storage if it exists there
        if (file.storagePath) {
            const deleteResult = await deleteFile(file.storagePath);
            
            if (!deleteResult.success) {
                console.warn(`Failed to delete file from storage: ${deleteResult.error}`);
                // Continue with database deletion even if storage deletion fails
            }
        }

        // Delete from database
        await prisma.file.delete({
            where: { id: req.params.fileId },
        });

        return res.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Delete file error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/workspaces/:id/files/:fileId/comments
router.post("/:id/files/:fileId/comments", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const file = await prisma.file.findUnique({
            where: { id: req.params.fileId },
            include: { workspace: true },
        });

        if (!file || file.workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { text, sender } = req.body;

        const comment = await prisma.fileComment.create({
            data: {
                fileId: req.params.fileId,
                text,
                sender: sender || "freelancer",
            },
        });

        return res.status(201).json({ comment });
    } catch (error) {
        console.error("Create file comment error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// ===== TODOS =====

// GET /api/workspaces/:id/todos
router.get("/:id/todos", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
        });

        if (!workspace || workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const todos = await prisma.todo.findMany({
            where: { workspaceId: req.params.id },
            orderBy: { createdAt: "asc" },
        });

        return res.json({ todos });
    } catch (error) {
        console.error("Get todos error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/workspaces/:id/todos
router.post("/:id/todos", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
        });

        if (!workspace || workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { title, status } = req.body;

        const todo = await prisma.todo.create({
            data: {
                workspaceId: req.params.id,
                title,
                status: status || "todo",
            },
        });

        return res.status(201).json({ todo });
    } catch (error) {
        console.error("Create todo error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /api/workspaces/:id/todos/:todoId
router.patch("/:id/todos/:todoId", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const todo = await prisma.todo.findUnique({
            where: { id: req.params.todoId },
            include: { workspace: true },
        });

        if (!todo || todo.workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { title, status } = req.body;

        const updated = await prisma.todo.update({
            where: { id: req.params.todoId },
            data: {
                ...(title !== undefined && { title }),
                ...(status !== undefined && { status }),
            },
        });

        return res.json({ todo: updated });
    } catch (error) {
        console.error("Update todo error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /api/workspaces/:id/todos/:todoId
router.delete("/:id/todos/:todoId", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const todo = await prisma.todo.findUnique({
            where: { id: req.params.todoId },
            include: { workspace: true },
        });

        if (!todo || todo.workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.todo.delete({
            where: { id: req.params.todoId },
        });

        return res.json({ message: "Todo deleted successfully" });
    } catch (error) {
        console.error("Delete todo error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// ===== MESSAGES =====

// GET /api/workspaces/:id/messages
router.get("/:id/messages", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
        });

        if (!workspace || workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const messages = await prisma.message.findMany({
            where: { workspaceId: req.params.id },
            orderBy: { createdAt: "asc" },
        });

        return res.json({ messages });
    } catch (error) {
        console.error("Get messages error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/workspaces/:id/messages
router.post("/:id/messages", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
        });

        if (!workspace || workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { text } = req.body;

        const message = await prisma.message.create({
            data: {
                workspaceId: req.params.id,
                text,
                sender: "freelancer",
            },
        });

        return res.status(201).json({ message });
    } catch (error) {
        console.error("Create message error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// ===== INVOICES =====

// GET /api/workspaces/:id/invoices
router.get("/:id/invoices", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
        });

        if (!workspace || workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const invoices = await prisma.invoice.findMany({
            where: { workspaceId: req.params.id },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ invoices });
    } catch (error) {
        console.error("Get invoices error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/workspaces/:id/invoices
router.post("/:id/invoices", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: req.params.id },
        });

        if (!workspace || workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { amount, dueDate, currency, taxPercentage, clientName } = req.body;

        // Get user to increment invoice counter and check PayPal.me
        const user = await prisma.user.findUnique({
            where: { id: currentUser.userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if user has PayPal.me username set up
        if (!user.paypalMeUsername || !user.paypalMeUsername.trim()) {
            return res.status(400).json({
                error: "Please set up your PayPal.me username in Settings before creating invoices"
            });
        }

        const invoiceNumber = `INV-${(user.invoiceCounter + 1).toString().padStart(4, "0")}`;

        const invoice = await prisma.invoice.create({
            data: {
                workspaceId: req.params.id,
                clientName: clientName || "Client",
                amount: parseFloat(amount),
                taxPercentage: parseFloat(taxPercentage) || 0,
                dueDate: new Date(dueDate),
                invoiceNumber,
                currency: currency || "USD",
                status: "draft",
            },
        });

        // Increment invoice counter
        await prisma.user.update({
            where: { id: currentUser.userId },
            data: { invoiceCounter: { increment: 1 } },
        });

        return res.status(201).json({ invoice });
    } catch (error) {
        console.error("Create invoice error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/workspaces/:id/invoices/:invoiceId
router.get("/:id/invoices/:invoiceId", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: req.params.invoiceId },
            include: { workspace: true },
        });

        if (!invoice || invoice.workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        return res.json({ invoice });
    } catch (error) {
        console.error("Get invoice error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PATCH /api/workspaces/:id/invoices/:invoiceId
router.patch("/:id/invoices/:invoiceId", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: req.params.invoiceId },
            include: { workspace: true },
        });

        if (!invoice || invoice.workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { amount, dueDate, status, paymentUrl } = req.body;

        const updated = await prisma.invoice.update({
            where: { id: req.params.invoiceId },
            data: {
                ...(amount !== undefined && { amount: parseFloat(amount) }),
                ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
                ...(status !== undefined && { status }),
                ...(paymentUrl !== undefined && { paymentUrl }),
            },
        });

        return res.json({ invoice: updated });
    } catch (error) {
        console.error("Update invoice error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /api/workspaces/:id/invoices/:invoiceId
router.delete("/:id/invoices/:invoiceId", async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: req.params.invoiceId },
            include: { workspace: true },
        });

        if (!invoice || invoice.workspace.userId !== currentUser.userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.invoice.delete({
            where: { id: req.params.invoiceId },
        });

        return res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Delete invoice error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
