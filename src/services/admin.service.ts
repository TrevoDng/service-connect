// src/services/admin.service.ts
import type { Booking } from '../types';
import { api } from './api.service';

export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT' | 'PROVIDER';
  status: string;
  createdAt: string;
  lastLogin?: string;
  approvedAt?: string;
  serviceType?: string;
  companyName?: string;
  registrationNumber?: string;
}

export const adminService = {

    // Registration Requests
  getRegistrationRequests: async (): Promise<any[]> => {
    return api.get('/admin/registration-requests');
  },

    resendRegistrationInvite: async (id: string): Promise<void> => {
    await api.post(`/admin/registration-requests/${id}/resend`, {});
  },

  declineRegistrationRequest: async (id: string): Promise<void> => {
    await api.patch(`/admin/registration-requests/${id}/decline`);
  },

  approveRegistrationRequest: async (id: string): Promise<void> => {
    await api.post(`/admin/registration-requests/${id}/approve`, {});
  },
  /** Get all users */
  getAllUsers: async (): Promise<ApiUser[]> => {
    const res = await api.get<{ users: ApiUser[] }>('/admin/users');
    return res.users;
  },

  /** Staff-only: list all bookings across the platform */
    getAllBookings: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
    }): Promise<Booking[]> => {
    const qp = new URLSearchParams();
    if (params?.status) qp.append('status', params.status);
    if (params?.limit !== undefined) qp.append('limit', String(params.limit));
    if (params?.offset !== undefined) qp.append('offset', String(params.offset));

    const qs = qp.toString();
    const url = `/admin/bookings${qs ? `?${qs}` : ''}`;

    const res = await api.get<{ bookings: Booking[]; total: number }>(url);
    return res.bookings;
    },

    /** Staff-only: get bookings where this user is client or provider */
    getUserBookings: async (userId: string): Promise<Booking[]> => {
    const res = await api.get<{ bookings: Booking[]; total: number }>(
        `/admin/users/${userId}/bookings`
    );
    return res.bookings;
    },

  /** Approve or reject an employee/provider */
  approveUser: async (userId: string, approve: boolean, reason?: string): Promise<void> => {
    await api.post('/admin/approve-employee', { userId, approve, reason });
  },

  /** Deactivate or activate a user */
  updateUserStatus: async (userId: string, status: string): Promise<void> => {
    await api.patch(`/admin/users/${userId}/status`, { status });
  }
};