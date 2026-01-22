import { PrismaClient } from '@prisma/client';

// Import getIO dynamically to avoid circular dependency during Next.js build
// The socket module is only available at runtime when the custom server is running
let getIO: () => any = () => null;

// This will be called after socket server is initialized
export function setSocketGetter(getter: () => any) {
    getIO = getter;
}

const prisma = new PrismaClient();

interface CreateNotificationParams {
    userId: string;
    type: string;
    title: string;
    description: string;
    link?: string;
    workspaceId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
    try {
        // Save notification to database
        const notification = await prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                description: params.description,
                link: params.link,
                workspaceId: params.workspaceId,
            },
        });

        // Emit real-time notification to user's Socket.io room
        const io = getIO();
        if (io) {
            io.to(`user:${params.userId}`).emit('notification', notification);
            console.log(`[Notification] Sent to user:${params.userId}`, notification);
        }

        return notification;
    } catch (error) {
        console.error('[Notification] Error creating notification:', error);
        throw error;
    }
}
