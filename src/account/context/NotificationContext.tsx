// src/account/context/NotificationContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import type { Notification } from '../../types';
import { demoNotifications } from '../../data/demoNotifications';
import { useAuth } from './AuthContext';

// ============================================
// DEMO USER MAPPING
// ============================================
//
// Until the backend is wired, we resolve the "current user id" per role
// against the demo notification data. When the real auth is ready,
// replace `resolveUserId()` with `user.id`.

const DEMO_IDS: Record<string, string> = {
  CLIENT: 'c-001',
  PROVIDER: 'p-001',
  EMPLOYEE: 'e-001',
  ADMIN: 'a-001',
};

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
  /** Push a new notification (used by future event handlers) */
  add: (notification: Notification) => void;
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

  // Resolve the demo user id from the role — falls back to CLIENT if
  // unauthenticated so the UI doesn't crash during development.
  const currentUserId = useMemo(() => {
    const role = user?.role ?? 'CLIENT';
    return DEMO_IDS[role] ?? DEMO_IDS.CLIENT;
  }, [user?.role]);

  // Seed with demo notifications that belong to the current user.
  // We deep-clone so mark-as-read mutations don't affect the source.
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    demoNotifications
      .filter((n) => n.userId === currentUserId)
      .map((n) => ({ ...n }))
  );

  // When the user id changes (role switch in dev), reload the seed.
  // This is a cheap way to keep things consistent without a backend.
  React.useEffect(() => {
    setNotifications(
      demoNotifications
        .filter((n) => n.userId === currentUserId)
        .map((n) => ({ ...n }))
    );
  }, [currentUserId]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && !n.readAt
          ? { ...n, readAt: new Date().toISOString() }
          : n
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: now }))
    );
  }, []);

  const add = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  // Sort newest first + compute unread count
  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  const unreadCount = useMemo(
    () => sorted.filter((n) => !n.readAt).length,
    [sorted]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications: sorted,
      unreadCount,
      markAsRead,
      markAllAsRead,
      add,
    }),
    [sorted, unreadCount, markAsRead, markAllAsRead, add]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
