import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "./prisma.js";

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
    return io;
}

export interface ChatMessage {
    id?: string;
    workspaceId: string;
    sender: string; // "freelancer" or "client"
    text: string;
    createdAt?: string;
}

export function initializeSocketServer(httpServer: HTTPServer) {
    const allowedOrigins = [
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:5173",
        process.env.FRONTEND_URL,
    ].filter(Boolean) as string[];

    io = new SocketIOServer(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log("New client connected:", socket.id);

        // Join user's personal room for notifications
        socket.on("join-user-room", (userId: string) => {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} joined their notification room`);
        });

        // Join workspace room for chat
        socket.on("join-workspace", (workspaceId: string) => {
            socket.join(`workspace:${workspaceId}`);
            console.log(`Socket ${socket.id} joined workspace:${workspaceId}`);
        });

        // Leave a workspace room
        socket.on("leave-workspace", (workspaceId: string) => {
            socket.leave(`workspace:${workspaceId}`);
            console.log(`Socket ${socket.id} left workspace:${workspaceId}`);
        });

        // Handle new message
        socket.on("send-message", async (message: ChatMessage) => {
            console.log("[Socket] Message received:", message);
            // Broadcast to all clients in the workspace room
            io?.to(`workspace:${message.workspaceId}`).emit("new-message", message);

            // Create notification for recipient
            try {
                const workspace = await prisma.workspace.findUnique({
                    where: { id: message.workspaceId },
                    select: { userId: true, name: true },
                });

                if (workspace && message.sender === "client") {
                    // Client sent message -> notify freelancer
                    // Create notification inline to avoid circular dependency
                    const notification = await prisma.notification.create({
                        data: {
                            userId: workspace.userId,
                            type: "message",
                            title: "New message from client",
                            description: message.text.length > 100
                                ? message.text.substring(0, 100) + "..."
                                : message.text,
                            link: `/workspace/${message.workspaceId}?tab=chat`,
                            workspaceId: message.workspaceId,
                        },
                    });
                    // Emit real-time notification
                    io?.to(`user:${workspace.userId}`).emit('notification', notification);
                } else if (workspace && message.sender === "freelancer") {
                    // Freelancer sent message -> emit client notification
                    const notification = {
                        id: Date.now().toString(),
                        type: "message",
                        title: "New message from freelancer",
                        description: message.text.length > 100
                            ? message.text.substring(0, 100) + "..."
                            : message.text,
                        timestamp: new Date().toISOString(),
                        read: false,
                    };
                    console.log(`[Socket] Emitting client-notification to workspace:${message.workspaceId}`, notification);
                    io?.to(`workspace:${message.workspaceId}`).emit("client-notification", notification);
                }
            } catch (error) {
                console.error("Error creating message notification:", error);
            }
        });

        // Handle invoice payment notification
        socket.on("invoice-paid", (data: { workspaceId: string; amount: number; workspaceName: string }) => {
            console.log("Invoice paid:", data);
            // Broadcast to all clients in the workspace room
            io?.to(`workspace:${data.workspaceId}`).emit("invoice-paid", data);
        });

        // Handle invoice payment notification
        socket.on("invoice-paid", (data: { workspaceId: string; amount: number; workspaceName: string }) => {
            console.log("Invoice paid:", data);
            // Broadcast to all clients in the workspace room
            io?.to(`workspace:${data.workspaceId}`).emit("invoice-paid", data);
        });

        // Handle task update notification
        socket.on("task-updated", (data: { workspaceId: string; taskTitle: string; oldStatus: string; newStatus: string }) => {
            console.log("Task updated:", data);
            // Broadcast to all clients in the workspace room
            io?.to(`workspace:${data.workspaceId}`).emit("task-updated", data);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
}

export function getSocketServer(): Socket | null {
    return io as any;
}

export function emitToWorkspace(workspaceId: string, event: string, data: any) {
    if (io) {
        io.to(`workspace:${workspaceId}`).emit(event, data);
    }
}
