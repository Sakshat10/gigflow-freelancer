import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./prisma.js";

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

    io.on("connection", (socket) => {
        console.log("✓ New socket connected:", socket.id);

        // Join user's personal notification room
        socket.on("join-user-room", (userId) => {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined notification room`);
        });

        // Join workspace room
        socket.on("join-workspace", (workspaceId) => {
            socket.join(`workspace:${workspaceId}`);
            console.log(`Socket ${socket.id} joined workspace:${workspaceId}`);
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

                    io?.to(`user:${workspace.userId}`).emit(
                        "notification",
                        notification
                    );
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
