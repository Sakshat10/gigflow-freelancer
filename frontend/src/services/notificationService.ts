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

// Ensure socket is connected for real-time notifications
// Note: The server auto-joins the user room on authenticated connection
export function joinUserRoom(userId: string) {
    const socket = initializeSocket();

    if (socket.connected) {
        console.log('[NotificationService] Socket already connected, user room auto-joined');
    } else {
        socket.once('connect', () => {
            console.log('[NotificationService] Socket connected, user room auto-joined by server');
        });
    }
}

// Track if listener is already set up
let notificationListenerSetup = false;

// Listen for real-time notification events
export function onNotification(callback: (notification: any) => void) {
    const socket = initializeSocket();

    const setupListener = () => {
        if (notificationListenerSetup) {
            console.log('[NotificationService] Notification listener already set up, skipping');
            return;
        }

        console.log('[NotificationService] Setting up notification listener on socket:', socket.id);
        socket.on('notification', callback);
        notificationListenerSetup = true;
    };

    // If socket is already connected, set up listener immediately
    if (socket.connected) {
        setupListener();
    } else {
        // Otherwise, wait for connection
        console.log('[NotificationService] Waiting for socket to connect before setting up listener...');
        socket.once('connect', () => {
            console.log('[NotificationService] Socket connected, now setting up notification listener');
            setupListener();
        });
    }
}

// Remove notification listener
export function offNotification(callback: (notification: any) => void) {
    const socket = initializeSocket();
    socket.off('notification', callback);
    notificationListenerSetup = false;
    console.log('[NotificationService] Removed notification listener');
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
