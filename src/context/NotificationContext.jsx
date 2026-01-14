import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { notificationService } from '../services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      // Use _id instead of id
      newSocket.emit('join', user._id);
    });

    // Listen for new notifications
    newSocket.on('notification', (notification) => {
      console.log('🔔 New notification received:', notification);

      const normalized = {
        ...notification,
        _id: notification._id || notification.id
      };

      setNotifications((prev) => [normalized, ...prev]);
      setUnreadCount((prev) => prev + 1);

      toast.success(notification.title || 'New notification', {
        duration: 4000,
        position: 'top-right'
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Cleaning up socket connection');
      newSocket.off('connect');
      newSocket.off('notification');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id]); // Only depend on _id

  // Fetch notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  // Fetch all notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20, unreadOnly = false) => {
    try {
      setLoading(true);
      const response = await notificationService.getAllNotifications(page, limit, unreadOnly);

      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();

      if (response.success) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);

      if (response.success) {
        setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      const response = await notificationService.clearAll();

      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success('All notifications cleared');
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      toast.error('Failed to clear notifications');
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    socket,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default NotificationContext;
