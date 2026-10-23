import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EmailNotification } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface NotificationContextType {
  notifications: EmailNotification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  isInboxOpen: boolean;
  setIsInboxOpen: (open: boolean) => void;
  activeEmail: EmailNotification | null;
  setActiveEmail: (email: EmailNotification | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [activeEmail, setActiveEmail] = useState<EmailNotification | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // If admin, show all emails; if customer, show customer's
      const filterEmail = user.role === 'admin' ? undefined : user.email;
      const res = await api.getNotifications(filterEmail);
      if (res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        isInboxOpen,
        setIsInboxOpen,
        activeEmail,
        setActiveEmail,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
