import { api } from './api.service';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'client' | 'employee' | 'admin';
  avatar?: string;
}

export const userService = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    return api.get(`/users/${userId}`);
  },

  updateProfile: async (userId: string, data: Partial<UserProfile>) => {
    return api.post(`/users/${userId}`, data);
  },

  changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    return api.post(`/users/${userId}/change-password`, { oldPassword, newPassword });
  },
};
