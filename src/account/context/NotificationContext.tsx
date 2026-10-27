// src/account/context/NotificationContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import type { Notification } from '../../types';
import { useAuth } from './AuthContext';
import { notificationService } from '../../services/notification.service';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  add: (notification: Notification) => void;
  addMany: (notifications: Notification[]) => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotifications = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);
  const hasLoadedRef = useRef(false);

  // ------------------------------------------
  // Fetch from backend
  // ------------------------------------------
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      hasLoadedRef.current = false;
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { notifications: list, unreadCount: count } =
          await notificationService.getMyNotifications(50);
        if (!cancelled) {
          setNotifications(list);
          setUnreadCount(count);
          hasLoadedRef.current = true;
        }
      } catch (err) {
        console.warn('[notifications] Failed to fetch', err);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, refreshTick]);

  // Poll every 10s while the tab is visible
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setRefreshTick((t) => t + 1);
      }
    }, 10_000);
    return () => window.clearInterval(id);
  }, [isAuthenticated]);

  // Refresh on focus
  useEffect(() => {
    if (!isAuthenticated) return;
    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        setRefreshTick((t) => t + 1);
      }
    };
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated]);

  // ------------------------------------------
  // Actions (optimistic + backend)
  // ------------------------------------------
  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.warn('[notifications] markAsRead failed', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.warn('[notifications] markAllAsRead failed', err);
    }
  }, []);

  const add = useCallback((_notification: Notification) => {
    // Backend is source of truth — notifications are created server-side.
    // Trigger a refresh so the bell picks it up on the next poll.
    // NOTE: chat / reviews / disputes still use `add()` locally; they'll
    // fire their own backend notifications in Phases 6-8.
    setRefreshTick((t) => t + 1);
  }, []);

  const addMany = useCallback((_notifications: Notification[]) => {
    setRefreshTick((t) => t + 1);
  }, []);

  const remove = useCallback(
    async (id: string) => {
      const target = notifications.find((n) => n.id === id);
      const wasUnread = target && !target.readAt;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await notificationService.deleteOne(id);
      } catch (err) {
        console.warn('[notifications] delete failed', err);
      }
    },
    [notifications]
  );

  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);

    try {
      await notificationService.clearAll();
    } catch (err) {
      console.warn('[notifications] clearAll failed', err);
    }
  }, []);

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
    [notifications, unreadCount, markAsRead, markAllAsRead, add, addMany, remove, clearAll]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;