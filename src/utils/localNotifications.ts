
// src/utils/localNotifications.ts
//
// Local persistence layer for notifications during the demo.
// When the backend is ready, replace the internals of these functions
// with API calls — the public API stays identical.

import type { Notification } from '../types';

const STORAGE_KEY = 'serviceconnect-local-notifications';
const SEED_FLAG_PREFIX = 'serviceconnect-notifications-seeded-';

// ============================================
// READ
// ============================================

export const getLocalNotifications = (): Notification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Notification[];
  } catch (err) {
    console.error('Failed to read local notifications:', err);
    return [];
  }
};

export const getNotificationsForUser = (userId: string): Notification[] => {
  return getLocalNotifications()
    .filter((n) => n.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

// ============================================
// WRITE
// ============================================

const writeAll = (notifications: Notification[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to write local notifications:', err);
  }
};

export const addLocalNotification = (notification: Notification): void => {
  const current = getLocalNotifications();
  writeAll([...current, notification]);
};

export const addLocalNotifications = (
  notifications: Notification[]
): void => {
  if (notifications.length === 0) return;
  const current = getLocalNotifications();
  writeAll([...current, ...notifications]);
};

export const markLocalNotificationRead = (id: string): void => {
  const now = new Date().toISOString();
  const current = getLocalNotifications();
  writeAll(
    current.map((n) =>
      n.id === id && !n.readAt ? { ...n, readAt: now } : n
    )
  );
};

export const markAllLocalNotificationsRead = (userId: string): void => {
  const now = new Date().toISOString();
  const current = getLocalNotifications();
  writeAll(
    current.map((n) =>
      n.userId === userId && !n.readAt ? { ...n, readAt: now } : n
    )
  );
};

export const deleteLocalNotification = (id: string): void => {
  const current = getLocalNotifications();
  writeAll(current.filter((n) => n.id !== id));
};

export const clearLocalNotifications = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear local notifications:', err);
  }
};

// ============================================
// SEED FLAG (per-user)
// ============================================
//
// Each demo user gets the demo notifications written into local storage
// the first time their feed is viewed. Keyed by userId so switching roles
// via /dev-login gives each role its own curated set.

export const hasSeededForUser = (userId: string): boolean => {
  try {
    return localStorage.getItem(SEED_FLAG_PREFIX + userId) === 'true';
  } catch {
    return false;
  }
};

export const markSeededForUser = (userId: string): void => {
  try {
    localStorage.setItem(SEED_FLAG_PREFIX + userId, 'true');
  } catch (err) {
    console.error('Failed to write seed flag:', err);
  }
};

export const clearSeededFlags = (): void => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SEED_FLAG_PREFIX)) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('Failed to clear seed flags:', err);
  }
};

