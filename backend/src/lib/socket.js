import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./prisma.js";
import { verifyToken } from "./auth.js";

let io = null;

export function getIO() {
    return io;
}

export function initializeSocketServer(httpServer) {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: [
                "http://localhost:3000",
                "https://gigflow-freelancer-dun.vercel.app",
            ],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            credentials: true,
        },
    });

    // Authentication middleware — verify JWT from cookie before connection
    io.use((socket, next) => {
        try {
            const cookies = socket.handshake.headers.cookie;
            if (!cookies) {
                return next(new Error("Authentication required"));
            }

            // Parse cookies manually (cookie-parser is Express middleware, not available here)
            const parsed = {};
            cookies.split(";").forEach((c) => {
                const [key, ...val] = c.trim().split("=");
                if (key) parsed[key.trim()] = val.join("=").trim();
            });

            const token = parsed["auth_token"];
            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = verifyToken(token);
            if (!decoded) {
                return next(new Error("Invalid or expired token"));
            }

            // Attach user info to socket
            socket.userId = decoded.userId;
            socket.userEmail = decoded.email;
            next();
        } catch (error) {
            console.error("[Socket] Auth error:", error.message);
            next(new Error("Authentication failed"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`✓ Socket connected: ${socket.id} (user: ${socket.userId})`);

        // Automatically join user's personal notification room
        const userRoom = `user:${socket.userId}`;
        socket.join(userRoom);
        console.log(`[Socket] Socket ${socket.id} auto-joined room: ${userRoom}`);

        // Join workspace room (verify ownership)
        socket.on("join-workspace", async (workspaceId) => {
            try {
                // Verify the user owns this workspace
                const workspace = await prisma.workspace.findFirst({
                    where: { id: workspaceId, userId: socket.userId },
                });
                if (!workspace) {
                    console.warn(`[Socket] User ${socket.userId} denied access to workspace ${workspaceId}`);
                    return;
                }
                socket.join(`workspace:${workspaceId}`);
                console.log(`Socket ${socket.id} joined workspace:${workspaceId}`);
            } catch (error) {
                console.error("[Socket] Join workspace error:", error);
            }
        });

        // Leave workspace room
        socket.on("leave-workspace", (workspaceId) => {
            socket.leave(`workspace:${workspaceId}`);
            console.log(`Socket ${socket.id} left workspace:${workspaceId}`);
        });

        // Handle new message
        socket.on("send-message", async (message) => {
            try {
                console.log("[Socket] Message received:", message);

                // Broadcast message to workspace
                io?.to(`workspace:${message.workspaceId}`).emit(
                    "new-message",
                    message
                );

                const workspace = await prisma.workspace.findUnique({
                    where: { id: message.workspaceId },
                    select: { userId: true },
                });

                if (!workspace) return;

                // Client → Freelancer notification
                if (message.sender === "client") {
                    const notification = await prisma.notification.create({
                        data: {
                            userId: workspace.userId,
                            type: "message",
                            title: "New message from client",
                            description:
                                message.text.length > 100
                                    ? message.text.substring(0, 100) + "..."
                                    : message.text,
                            link: `/workspace/${message.workspaceId}?tab=chat`,
                            workspaceId: message.workspaceId,
                        },
                    });

                    console.log("[Socket] Created message notification for user:", workspace.userId);
                    io?.to(`user:${workspace.userId}`).emit(
                        "notification",
                        notification
                    );
                    console.log("[Socket] Emitted message notification to user room:", `user:${workspace.userId}`);
                }

                // Freelancer → Client notification
                if (message.sender === "freelancer") {
                    const notification = {
                        id: Date.now().toString(),
                        type: "message",
                        title: "New message from freelancer",
                        description:
                            message.text.length > 100
                                ? message.text.substring(0, 100) + "..."
                                : message.text,
                        timestamp: new Date().toISOString(),
                        read: false,
                    };

                    io?.to(`workspace:${message.workspaceId}`).emit(
                        "client-notification",
                        notification
                    );
                }
            } catch (error) {
                console.error("Socket message error:", error);
            }
        });

        // Invoice paid
        socket.on("invoice-paid", (data) => {
            console.log("Invoice paid:", data);
            io?.to(`workspace:${data.workspaceId}`).emit(
                "invoice-paid",
                data
            );
        });

        // Task updated
        socket.on("task-updated", (data) => {
            console.log("Task updated:", data);
            io?.to(`workspace:${data.workspaceId}`).emit(
                "task-updated",
                data
            );
        });

        // File uploaded
        socket.on("file-uploaded", async (data) => {
            console.log("[Socket] File uploaded:", data);
            io?.to(`workspace:${data.workspaceId}`).emit("file-uploaded", data);

            try {
                const workspace = await prisma.workspace.findUnique({
                    where: { id: data.workspaceId },
                    select: { userId: true, name: true },
                });

                if (!workspace) return;

                // Determine who uploaded
                const uploadedBy = data.file.uploadedBy;

                // Client → Freelancer notification
                if (uploadedBy === "client") {
                    const notification = await prisma.notification.create({
                        data: {
                            userId: workspace.userId,
                            type: "file",
                            title: "New file uploaded",
                            description: `Client uploaded: ${data.file.filename}`,
                            link: `/workspace/${data.workspaceId}?tab=files`,
                            workspaceId: data.workspaceId,
                        },
                    });

                    console.log("[Socket] Created notification for user:", workspace.userId, notification);

                    // Debug: Check which sockets are in the user room
                    const userRoom = `user:${workspace.userId}`;
                    const socketsInRoom = await io?.in(userRoom).allSockets();
                    console.log(`[Socket] Sockets in room ${userRoom}:`, socketsInRoom ? Array.from(socketsInRoom) : 'none');

                    io?.to(userRoom).emit("notification", notification);
                    console.log("[Socket] Emitted notification to user room:", userRoom);
                }

                // Freelancer → Client notification
                if (uploadedBy === "freelancer") {
                    const notification = {
                        id: Date.now().toString(),
                        type: "file",
                        title: "New file uploaded",
                        description: `Freelancer uploaded: ${data.file.filename}`,
                        timestamp: new Date().toISOString(),
                        read: false,
                    };

                    io?.to(`workspace:${data.workspaceId}`).emit("client-notification", notification);
                }
            } catch (error) {
                console.error("File upload notification error:", error);
            }
        });

        // File deleted
        socket.on("file-deleted", async (data) => {
            console.log("[Socket] File deleted:", data);
            io?.to(`workspace:${data.workspaceId}`).emit("file-deleted", data);

            try {
                const workspace = await prisma.workspace.findUnique({
                    where: { id: data.workspaceId },
                    select: { userId: true },
                });

                if (!workspace) return;

                // Note: We don't know who deleted it from this event, so we skip notifications
                // or you could add a 'deletedBy' field to the event
            } catch (error) {
                console.error("File delete notification error:", error);
            }
        });

        // File comment added
        socket.on("file-comment-added", async (data) => {
            console.log("[Socket] File comment added:", data);
            io?.to(`workspace:${data.workspaceId}`).emit("file-comment-added", data);

            try {
                const workspace = await prisma.workspace.findUnique({
                    where: { id: data.workspaceId },
                    select: { userId: true },
                });

                if (!workspace) return;

                const file = await prisma.file.findUnique({
                    where: { id: data.fileId },
                    select: { filename: true },
                });

                if (!file) return;

                // Client → Freelancer notification
                if (data.comment.sender === "client") {
                    const notification = await prisma.notification.create({
                        data: {
                            userId: workspace.userId,
                            type: "file_comment",
                            title: "New comment on file",
                            description: `Client commented on ${file.filename}`,
                            link: `/workspace/${data.workspaceId}?tab=files`,
                            workspaceId: data.workspaceId,
                        },
                    });

                    console.log("[Socket] Created file comment notification for user:", workspace.userId);
                    io?.to(`user:${workspace.userId}`).emit("notification", notification);
                    console.log("[Socket] Emitted notification to user room:", `user:${workspace.userId}`);
                }

                // Freelancer → Client notification
                if (data.comment.sender === "freelancer") {
                    const notification = {
                        id: Date.now().toString(),
                        type: "file_comment",
                        title: "New comment on file",
                        description: `Freelancer commented on ${file.filename}`,
                        timestamp: new Date().toISOString(),
                        read: false,
                    };

                    io?.to(`workspace:${data.workspaceId}`).emit("client-notification", notification);
                }
            } catch (error) {
                console.error("File comment notification error:", error);
            }
        });

        // Invoice created
        socket.on("invoice-created", async (data) => {
            console.log("[Socket] Invoice created:", data);
            io?.to(`workspace:${data.workspaceId}`).emit("invoice-created", data);

            try {
                const workspace = await prisma.workspace.findUnique({
                    where: { id: data.workspaceId },
                    select: { userId: true },
                });

                if (!workspace) return;

                // Only send notification to client if invoice is not a draft
                const isDraft = data.invoice.status?.toLowerCase() === 'draft';

                if (!isDraft) {
                    // Freelancer → Client notification
                    const notification = {
                        id: Date.now().toString(),
                        type: "invoice",
                        title: "New invoice created",
                        description: `Invoice ${data.invoice.invoiceNumber || 'created'} - $${data.invoice.amount}`,
                        timestamp: new Date().toISOString(),
                        read: false,
                    };

                    io?.to(`workspace:${data.workspaceId}`).emit("client-notification", notification);
                    console.log("[Socket] Sent invoice notification to client (non-draft)");
                } else {
                    console.log("[Socket] Skipped client notification for draft invoice");
                }
            } catch (error) {
                console.error("Invoice created notification error:", error);
            }
        });

        // Invoice deleted
        socket.on("invoice-deleted", async (data) => {
            console.log("[Socket] Invoice deleted:", data);
            io?.to(`workspace:${data.workspaceId}`).emit("invoice-deleted", data);
        });

        // Task created
        socket.on("task-created", async (data) => {
            console.log("[Socket] Task created:", data);
            io?.to(`workspace:${data.workspaceId}`).emit("task-created", data);

            try {
                const workspace = await prisma.workspace.findUnique({
                    where: { id: data.workspaceId },
                    select: { userId: true },
                });

                if (!workspace) return;

                // Freelancer → Client notification
                const notification = {
                    id: Date.now().toString(),
                    type: "task",
                    title: "New task created",
                    description: `Task: ${data.task.title}`,
                    timestamp: new Date().toISOString(),
                    read: false,
                };

                io?.to(`workspace:${data.workspaceId}`).emit("client-notification", notification);
            } catch (error) {
                console.error("Task created notification error:", error);
            }
        });

        // Task status updated
        socket.on("task-status-updated", async (data) => {
            console.log("[Socket] Task status updated:", data);
            io?.to(`workspace:${data.workspaceId}`).emit("task-status-updated", data);

            try {
                const workspace = await prisma.workspace.findUnique({
                    where: { id: data.workspaceId },
                    select: { userId: true },
                });

                if (!workspace) return;

                // Map status to readable text
                const statusMap = {
                    'todo': 'To Do',
                    'in-progress': 'In Progress',
                    'done': 'Done'
                };

                // Freelancer → Client notification
                const notification = {
                    id: Date.now().toString(),
                    type: "task_updated",
                    title: "Task status updated",
                    description: `${data.task.title} moved to ${statusMap[data.task.status] || data.task.status}`,
                    timestamp: new Date().toISOString(),
                    read: false,
                };

                io?.to(`workspace:${data.workspaceId}`).emit("client-notification", notification);
            } catch (error) {
                console.error("Task status notification error:", error);
            }
        });

        // Task deleted
        socket.on("task-deleted", async (data) => {
            console.log("[Socket] Task deleted:", data);
            io?.to(`workspace:${data.workspaceId}`).emit("task-deleted", data);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    return io;
}

export function getSocketServer() {
    return io;
}

export function emitToWorkspace(workspaceId, event, data) {
    if (io) {
        io.to(`workspace:${workspaceId}`).emit(event, data);
    }
}
