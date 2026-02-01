// Chat service with Socket.io for real-time messaging
import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Types
export interface ChatMessage {
    id: string;
    workspaceId: string;
    sender: "freelancer" | "client";
    text: string;
    createdAt: string;
}

// Socket instance
let socket: Socket | null = null;

// Initialize socket connection
export function initializeSocket(): Socket {
    if (!socket) {
        socket = io(API_URL, {
            transports: ["websocket", "polling"],
            autoConnect: true,
        });

        socket.on("connect", () => {
            console.log("Socket connected:", socket?.id);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });
    }

    return socket;
}

// Get current socket instance
export function getSocket(): Socket | null {
    return socket;
}

// Join a workspace room
export function joinWorkspace(workspaceId: string): void {
    const s = initializeSocket();
    console.log(`[ChatService] Joining workspace room: workspace:${workspaceId}`);
    s.emit("join-workspace", workspaceId);
}

// Leave a workspace room
export function leaveWorkspace(workspaceId: string): void {
    if (socket) {
        socket.emit("leave-workspace", workspaceId);
    }
}

// Send a message via socket (real-time broadcast)
export function sendMessageSocket(message: ChatMessage): void {
    if (socket) {
        console.log('[ChatService] Sending message via socket:', message);
        socket.emit("send-message", message);
    }
}

// Listen for new messages
export function onNewMessage(callback: (message: ChatMessage) => void): void {
    const s = initializeSocket();
    s.on("new-message", callback);
}

// Remove message listener
export function offNewMessage(callback: (message: ChatMessage) => void): void {
    if (socket) {
        socket.off("new-message", callback);
    }
}

// Emit invoice paid event
export function emitInvoicePaid(data: { workspaceId: string; amount: number; workspaceName: string }): void {
    if (socket) {
        socket.emit("invoice-paid", data);
    }
}

// Listen for invoice paid events
export function onInvoicePaid(callback: (data: { workspaceId: string; amount: number; workspaceName: string }) => void): void {
    const s = initializeSocket();
    s.on("invoice-paid", callback);
}

// Remove invoice paid listener
export function offInvoicePaid(callback: (data: { workspaceId: string; amount: number; workspaceName: string }) => void): void {
    if (socket) {
        socket.off("invoice-paid", callback);
    }
}

// Emit task updated event
export function emitTaskUpdated(data: { workspaceId: string; taskTitle: string; oldStatus: string; newStatus: string }): void {
    if (socket) {
        socket.emit("task-updated", data);
    }
}

// Listen for task updated events
export function onTaskUpdated(callback: (data: { workspaceId: string; taskTitle: string; oldStatus: string; newStatus: string }) => void): void {
    const s = initializeSocket();
    s.on("task-updated", callback);
}

// Remove task updated listener
export function offTaskUpdated(callback: (data: { workspaceId: string; taskTitle: string; oldStatus: string; newStatus: string }) => void): void {
    if (socket) {
        socket.off("task-updated", callback);
    }
}

// Client notification type (for client-side display)
export interface ClientNotification {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
}

// Listen for client notifications (from freelancer)
export function onClientNotification(callback: (notification: ClientNotification) => void): void {
    const s = initializeSocket();
    console.log('[ChatService] Setting up client-notification listener');
    s.on("client-notification", callback);
}

// Remove client notification listener
export function offClientNotification(callback: (notification: ClientNotification) => void): void {
    if (socket) {
        console.log('[ChatService] Removing client-notification listener');
        socket.off("client-notification", callback);
    }
}

// Disconnect socket
export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

// ----- Real-time File Events -----

export interface FileEvent {
    workspaceId: string;
    file: any; // WorkspaceFile type
}

export interface FileDeleteEvent {
    workspaceId: string;
    fileId: string;
}

export interface FileCommentEvent {
    workspaceId: string;
    fileId: string;
    comment: any; // FileComment type
}

// Emit file uploaded event
export function emitFileUploaded(data: FileEvent): void {
    if (socket) {
        console.log('[Socket] Emitting file-uploaded:', data);
        socket.emit("file-uploaded", data);
    }
}

// Listen for file uploaded events
export function onFileUploaded(callback: (data: FileEvent) => void): void {
    const s = initializeSocket();
    s.on("file-uploaded", callback);
}

// Remove file uploaded listener
export function offFileUploaded(callback: (data: FileEvent) => void): void {
    if (socket) {
        socket.off("file-uploaded", callback);
    }
}

// Emit file deleted event
export function emitFileDeleted(data: FileDeleteEvent): void {
    if (socket) {
        console.log('[Socket] Emitting file-deleted:', data);
        socket.emit("file-deleted", data);
    }
}

// Listen for file deleted events
export function onFileDeleted(callback: (data: FileDeleteEvent) => void): void {
    const s = initializeSocket();
    s.on("file-deleted", callback);
}

// Remove file deleted listener
export function offFileDeleted(callback: (data: FileDeleteEvent) => void): void {
    if (socket) {
        socket.off("file-deleted", callback);
    }
}

// Emit file comment added event
export function emitFileCommentAdded(data: FileCommentEvent): void {
    if (socket) {
        console.log('[Socket] Emitting file-comment-added:', data);
        socket.emit("file-comment-added", data);
    }
}

// Listen for file comment added events
export function onFileCommentAdded(callback: (data: FileCommentEvent) => void): void {
    const s = initializeSocket();
    s.on("file-comment-added", callback);
}

// Remove file comment added listener
export function offFileCommentAdded(callback: (data: FileCommentEvent) => void): void {
    if (socket) {
        socket.off("file-comment-added", callback);
    }
}

// ----- Real-time Invoice Events -----

export interface InvoiceEvent {
    workspaceId: string;
    invoice: any; // Invoice type
}

export interface InvoiceDeleteEvent {
    workspaceId: string;
    invoiceId: string;
}

// Emit invoice created event
export function emitInvoiceCreated(data: InvoiceEvent): void {
    if (socket) {
        console.log('[Socket] Emitting invoice-created:', data);
        socket.emit("invoice-created", data);
    }
}

// Listen for invoice created events
export function onInvoiceCreated(callback: (data: InvoiceEvent) => void): void {
    const s = initializeSocket();
    s.on("invoice-created", callback);
}

// Remove invoice created listener
export function offInvoiceCreated(callback: (data: InvoiceEvent) => void): void {
    if (socket) {
        socket.off("invoice-created", callback);
    }
}

// Emit invoice deleted event
export function emitInvoiceDeleted(data: InvoiceDeleteEvent): void {
    if (socket) {
        console.log('[Socket] Emitting invoice-deleted:', data);
        socket.emit("invoice-deleted", data);
    }
}

// Listen for invoice deleted events
export function onInvoiceDeleted(callback: (data: InvoiceDeleteEvent) => void): void {
    const s = initializeSocket();
    s.on("invoice-deleted", callback);
}

// Remove invoice deleted listener
export function offInvoiceDeleted(callback: (data: InvoiceDeleteEvent) => void): void {
    if (socket) {
        socket.off("invoice-deleted", callback);
    }
}

// ----- Real-time Task Events -----

export interface TaskEvent {
    workspaceId: string;
    task: any; // Task type
}

export interface TaskDeleteEvent {
    workspaceId: string;
    taskId: string;
}

// Emit task created event
export function emitTaskCreated(data: TaskEvent): void {
    if (socket) {
        console.log('[Socket] Emitting task-created:', data);
        socket.emit("task-created", data);
    }
}

// Listen for task created events
export function onTaskCreated(callback: (data: TaskEvent) => void): void {
    const s = initializeSocket();
    s.on("task-created", callback);
}

// Remove task created listener
export function offTaskCreated(callback: (data: TaskEvent) => void): void {
    if (socket) {
        socket.off("task-created", callback);
    }
}

// Emit task status updated event
export function emitTaskStatusUpdated(data: TaskEvent): void {
    if (socket) {
        console.log('[Socket] Emitting task-status-updated:', data);
        socket.emit("task-status-updated", data);
    }
}

// Listen for task status updated events
export function onTaskStatusUpdated(callback: (data: TaskEvent) => void): void {
    const s = initializeSocket();
    s.on("task-status-updated", callback);
}

// Remove task status updated listener
export function offTaskStatusUpdated(callback: (data: TaskEvent) => void): void {
    if (socket) {
        socket.off("task-status-updated", callback);
    }
}

// Emit task deleted event
export function emitTaskDeleted(data: TaskDeleteEvent): void {
    if (socket) {
        console.log('[Socket] Emitting task-deleted:', data);
        socket.emit("task-deleted", data);
    }
}

// Listen for task deleted events
export function onTaskDeleted(callback: (data: TaskDeleteEvent) => void): void {
    const s = initializeSocket();
    s.on("task-deleted", callback);
}

// Remove task deleted listener
export function offTaskDeleted(callback: (data: TaskDeleteEvent) => void): void {
    if (socket) {
        socket.off("task-deleted", callback);
    }
}

// ----- REST API Functions (for persistence) -----

// Fetch messages from database (freelancer side - requires auth)
export async function fetchMessages(workspaceId: string): Promise<ChatMessage[]> {
    try {
        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/messages`, {
            credentials: "include",
        });

        if (!response.ok) {
            console.error("Failed to fetch messages:", response.status);
            return [];
        }

        const data = await response.json();
        return data.messages || [];
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
}

// Fetch messages from database (client side - no auth)
export async function fetchMessagesAsClient(shareTokenOrId: string): Promise<ChatMessage[]> {
    try {
        const response = await fetch(`${API_URL}/api/client/${shareTokenOrId}/messages`);

        if (!response.ok) {
            console.error("Failed to fetch messages:", response.status);
            return [];
        }

        const data = await response.json();
        return data.messages || [];
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
}

// Save message to database (freelancer side)
export async function sendMessage(
    workspaceId: string,
    text: string
): Promise<ChatMessage | null> {
    try {
        const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            console.error("Failed to send message:", response.status);
            return null;
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error("Error sending message:", error);
        return null;
    }
}

// Save message to database (client side)
export async function sendMessageAsClient(
    shareTokenOrId: string,
    text: string
): Promise<ChatMessage | null> {
    try {
        const response = await fetch(`${API_URL}/api/client/${shareTokenOrId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            console.error("Failed to send message:", response.status);
            return null;
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error("Error sending message:", error);
        return null;
    }
}
