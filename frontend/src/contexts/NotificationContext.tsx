import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Notification } from '@/types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import {
  fetchNotifications,
  joinUserRoom,
  onNotification,
  offNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications
} from '@/services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  handleNotificationClick: (notification: Notification) => void;
  clearNotificationsByLink: (linkPattern: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const socketInitialized = useRef(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch initial notifications and setup real-time listener
  useEffect(() => {
    if (!isAuthenticated || socketInitialized.current || !user) return;

    console.log('[NotificationContext] Setting up notifications for user:', user.id);

    // Fetch initial notifications from API
    fetchNotifications().then(apiNotifications => {
      if (apiNotifications && apiNotifications.length > 0) {
        console.log('[NotificationContext] Loaded', apiNotifications.length, 'notifications from API');
        setNotifications(apiNotifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.createdAt),
        })));
      }
    });

    // Join user's Socket.io room
    joinUserRoom(user.id);
    socketInitialized.current = true;

    // Listen for real-time notifications
    const handleNotification = (notification: any) => {
      console.log('[NotificationContext] Received real-time notification:', notification);

      const newNotification: Notification = {
        ...notification,
        timestamp: new Date(notification.createdAt),
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Show toast
      toast(notification.title, {
        description: notification.description,
      });
    };

    onNotification(handleNotification);

    return () => {
      offNotification(handleNotification);
    };
  }, [isAuthenticated, user]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    // Update local state immediately for instant UI feedback
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );

    // Persist to backend
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error('[NotificationContext] Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Update local state immediately
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Persist to backend
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('[NotificationContext] Error marking all notifications as read:', error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    // Clear local state immediately
    setNotifications([]);

    // Delete from backend
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error('[NotificationContext] Error clearing notifications:', error);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotificationsByLink = useCallback((linkPattern: string) => {
    setNotifications(prev =>
      prev.filter(n => !n.link?.includes(linkPattern))
    );
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  }, [navigate, markAsRead]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        handleNotificationClick,
        clearNotificationsByLink,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
