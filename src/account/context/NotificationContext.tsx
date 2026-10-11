
// src/account/context/NotificationContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import type { Notification } from '../../types';
import { demoNotifications } from '../../data/demoNotifications';
import { resolveUserId } from '../utils/resolveUserId';
import {
  getNotificationsForUser,
  addLocalNotification,
  addLocalNotifications,
  markLocalNotificationRead,
  markAllLocalNotificationsRead,
  deleteLocalNotification,
  clearLocalNotifications,
  hasSeededForUser,
  markSeededForUser,
} from '../../utils/localNotifications';
import { useAuth } from './AuthContext';

// ============================================
// CONTEXT
// ============================================

interface NotificationContextValue {
  /** All notifications for the current user, sorted newest first */
  notifications: Notification[];
  /** Number of unread notifications */
  unreadCount: number;
  /** Mark a single notification as read */
  markAsRead: (id: string) => void;
  /** Mark every notification for the current user as read */
  markAllAsRead: () => void;
  /** Push a new notification for the current user */
  add: (notification: Notification) => void;
  /** Push several notifications at once (used when one event fires two) */
  addMany: (notifications: Notification[]) => void;
  /** Remove a single notification */
  remove: (id: string) => void;
  /** Clear all notifications (wipes local storage) */
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export const useNotifications = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return ctx;
};

// ============================================
// PROVIDER
// ============================================

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();

  // Single source of truth for the "current user id" during the demo.
  const currentUserId = useMemo(
    () => resolveUserId(user),
    [user]
  );

  // Local state mirrors localStorage. We re-read on user change.
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  // ------------------------------------------
  // Seed once per user, then read local storage
  // ------------------------------------------
  useEffect(() => {
    // 1. Seed demo notifications for this user if we haven't yet.
    if (!hasSeededForUser(currentUserId)) {
      const seedForUser = demoNotifications
        .filter((n) => n.userId === currentUserId)
        .map((n) => ({ ...n }));
      if (seedForUser.length > 0) {
        addLocalNotifications(seedForUser);
      }
      markSeededForUser(currentUserId);
    }

    // 2. Read local storage (source of truth).
    setNotifications(getNotificationsForUser(currentUserId));
  }, [currentUserId, refreshTick]);

  // ------------------------------------------
  // Actions — each writes through to storage
  // ------------------------------------------
  const markAsRead = useCallback((id: string) => {
    markLocalNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && !n.readAt
          ? { ...n, readAt: new Date().toISOString() }
          : n
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    markAllLocalNotificationsRead(currentUserId);
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: now }))
    );
  }, [currentUserId]);

  const add = useCallback((notification: Notification) => {
    addLocalNotification(notification);
    // Only surface it if it belongs to the current user's feed.
    if (notification.userId === currentUserId) {
      setNotifications((prev) =>
        [notification, ...prev].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
      );
    }
  }, [currentUserId]);

  const addMany = useCallback(
    (list: Notification[]) => {
      addLocalNotifications(list);
      const mine = list.filter((n) => n.userId === currentUserId);
      if (mine.length > 0) {
        setNotifications((prev) =>
          [...mine, ...prev].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
        );
      }
    },
    [currentUserId]
  );

  const remove = useCallback((id: string) => {
    deleteLocalNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    clearLocalNotifications();
    setNotifications([]);
    // Force a re-seed on next mount for this user.
    setRefreshTick((t) => t + 1);
  }, []);

  // ------------------------------------------
  // Derived
  // ------------------------------------------
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      add,
      addMany,
      remove,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      add,
      addMany,
      remove,
      clearAll,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;

