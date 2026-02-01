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
    
    const doJoin = () => {
        socket.emit('join-user-room', userId);
        console.log('[NotificationService] Joined user room:', userId);
        
        // Debug: Log socket info
        setTimeout(() => {
            console.log('[NotificationService] Socket ID:', socket.id);
            console.log('[NotificationService] Socket connected:', socket.connected);
        }, 500);
    };
    
    // If socket is already connected, join immediately
    if (socket.connected) {
        doJoin();
    } else {
        // Otherwise, wait for connection
        console.log('[NotificationService] Waiting for socket to connect...');
        socket.once('connect', () => {
            console.log('[NotificationService] Socket connected, now joining user room');
            doJoin();
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
