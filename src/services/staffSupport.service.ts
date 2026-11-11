// src/services/staffSupport.service.ts
import { api } from './api.service';
import type { SupportTicket, SupportMessage, ChatAttachment } from '../types';

export interface StaffSupportTicket extends SupportTicket {
  requester: {
    id: string;
    displayName: string;
    email: string;
    role: 'CLIENT' | 'PROVIDER';
    avatarGradient: string;
  };
  assignedStaffId?: string;
  assignedStaffDisplayName?: string;
  isMine: boolean;
  canReply: boolean;
}

export type StaffTicketFilter = 'active' | 'open' | 'claimed' | 'closed' | 'all';

export const staffSupportService = {
  getTickets: async (params?: {
    status?: StaffTicketFilter;
    assignedToMe?: boolean;
    unassigned?: boolean;
  }): Promise<StaffSupportTicket[]> => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.assignedToMe) qs.set('assignedToMe', 'true');
    if (params?.unassigned) qs.set('unassigned', 'true');
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const res = await api.get<{ tickets: StaffSupportTicket[] }>(
      `/admin/support/tickets${suffix}`
    );
    return res.tickets;
  },

  getMessages: async (ticketId: string): Promise<SupportMessage[]> => {
    const res = await api.get<{ messages: SupportMessage[] }>(
      `/admin/support/tickets/${ticketId}/messages`
    );
    return res.messages;
  },

  claim: async (ticketId: string): Promise<StaffSupportTicket> => {
    const res = await api.post<{ ticket: StaffSupportTicket }>(
      `/admin/support/tickets/${ticketId}/claim`,
      {}
    );
    return res.ticket;
  },

  release: async (ticketId: string): Promise<StaffSupportTicket> => {
    const res = await api.post<{ ticket: StaffSupportTicket }>(
      `/admin/support/tickets/${ticketId}/release`,
      {}
    );
    return res.ticket;
  },

  sendMessage: async (
    ticketId: string,
    text: string,
    attachments?: ChatAttachment[]
  ): Promise<SupportMessage> => {
    const res = await api.post<{ message: SupportMessage }>(
      `/admin/support/tickets/${ticketId}/messages`,
      { text, attachments }
    );
    return res.message;
  },

  close: async (ticketId: string): Promise<StaffSupportTicket> => {
    const res = await api.post<{ ticket: StaffSupportTicket }>(
      `/admin/support/tickets/${ticketId}/close`,
      {}
    );
    return res.ticket;
  },

  reopen: async (ticketId: string): Promise<StaffSupportTicket> => {
    const res = await api.post<{ ticket: StaffSupportTicket }>(
      `/admin/support/tickets/${ticketId}/reopen`,
      {}
    );
    return res.ticket;
  },

  markRead: async (ticketId: string): Promise<void> => {
    await api.post(`/admin/support/tickets/${ticketId}/read`, {});
  },
};