// src/services/support.service.ts
import { api } from './api.service';
import type { SupportTicket, SupportMessage, ChatAttachment } from '../types';

export const supportService = {
  // ==========================================
  // REQUESTER (CLIENT + PROVIDER)
  // ==========================================

  getMyTickets: async (): Promise<SupportTicket[]> => {
    const res = await api.get<{ tickets: SupportTicket[] }>(
      '/support/tickets'
    );
    return res.tickets;
  },

  getTicket: async (id: string): Promise<SupportTicket> => {
    const res = await api.get<{ ticket: SupportTicket }>(
      `/support/tickets/${id}`
    );
    return res.ticket;
  },

  getTicketMessages: async (id: string): Promise<SupportMessage[]> => {
    const res = await api.get<{ messages: SupportMessage[] }>(
      `/support/tickets/${id}/messages`
    );
    return res.messages;
  },

  createTicket: async (input: {
    subject?: string;
    text: string;
    attachments?: ChatAttachment[];
  }): Promise<{ ticket: SupportTicket; message: SupportMessage }> => {
    return api.post('/support/tickets', input);
  },

  sendMessage: async (
    ticketId: string,
    text: string,
    attachments?: ChatAttachment[]
  ): Promise<SupportMessage> => {
    const res = await api.post<{ message: SupportMessage }>(
      `/support/tickets/${ticketId}/messages`,
      { text, attachments }
    );
    return res.message;
  },

  markRead: async (ticketId: string): Promise<void> => {
    await api.post(`/support/tickets/${ticketId}/read`, {});
  },
};