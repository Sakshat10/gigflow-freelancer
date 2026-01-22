import { initializeSocket } from './chatService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Fetch user's notifications from API
export async function fetchNotifications() {
    try {
        const response = await fetch(`${API_URL}/api/notifications`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        return await response.json();
    } catch (error) {
        console.error('[NotificationService] Error fetching notifications:', error);
        return [];
    }
}

// Mark specific notification as read
export async function markNotificationAsRead(notificationId: string) {
    try {
        const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }

        return await response.json();
    } catch (error) {
        console.error('[NotificationService] Error marking notification as read:', error);
        throw error;
    }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
    try {
        const response = await fetch(`${API_URL}/api/notifications`, {
            method: 'PATCH',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to mark all notifications as read');
        }

        return await response.json();
    } catch (error) {
        console.error('[NotificationService] Error marking all notifications as read:', error);
        throw error;
    }
}

// Join user's Socket.io room for real-time notifications
export function joinUserRoom(userId: string) {
    const socket = initializeSocket();
    socket.emit('join-user-room', userId);
    console.log('[NotificationService] Joined user room:', userId);
}

// Listen for real-time notification events
export function onNotification(callback: (notification: any) => void) {
    const socket = initializeSocket();
    socket.on('notification', callback);
}

// Remove notification listener
export function offNotification(callback: (notification: any) => void) {
    const socket = initializeSocket();
    socket.off('notification', callback);
}

// Delete all user notifications
export async function clearAllNotifications() {
    try {
        const response = await fetch(`${API_URL}/api/notifications`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to clear notifications');
        }

        return await response.json();
    } catch (error) {
        console.error('[NotificationService] Error clearing notifications:', error);
        throw error;
    }
}
