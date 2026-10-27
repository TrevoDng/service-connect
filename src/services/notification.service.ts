// src/services/notification.service.ts
import { api } from './api.service';
import type { Notification } from '../types';

export const notificationService = {
  getMyNotifications: async (limit = 50): Promise<{
    notifications: Notification[];
    unreadCount: number;
  }> => {
    const result = await api.get<{
      notifications: Notification[];
      unreadCount: number;
    }>(`/notifications?limit=${limit}`);
    return result;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },

  deleteOne: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  clearAll: async (): Promise<void> => {
    await api.delete('/notifications');
  },
};