// src/services/chat.service.ts
import { api } from './api.service';
import type { ChatThread, ChatMessage, ChatAttachment } from '../types';


export const chatService = {
  // ==========================================
  // CLIENT + PROVIDER
  // ==========================================

  getMyThreads: async (): Promise<ChatThread[]> => {
    const res = await api.get<{ threads: ChatThread[] }>('/chat/threads');
    return res.threads;
  },

  getThreadMessages: async (threadId: string): Promise<ChatMessage[]> => {
    const res = await api.get<{ messages: ChatMessage[] }>(
      `/chat/threads/${threadId}/messages`
    );
    return res.messages;
  },

  sendMessage: async (
    threadId: string,
    text: string,
    attachments?: ChatAttachment[]
  ): Promise<ChatMessage> => {
    const res = await api.post<{ message: ChatMessage }>(
      `/chat/threads/${threadId}/messages`,
      { text, attachments }
    );
    return res.message;
  },

  markThreadRead: async (threadId: string): Promise<void> => {
    await api.post(`/chat/threads/${threadId}/read`, {});
  },

  getOrCreateThread: async (
    clientId: string,
    providerId: string,
    linkedBookingId?: string
  ): Promise<ChatThread> => {
    const res = await api.post<{ thread: ChatThread }>('/chat/threads', {
      clientId,
      providerId,
      linkedBookingId,
    });
    return res.thread;
  },

  // ==========================================
  // STAFF OBSERVER (ADMIN + EMPLOYEE)
  // ==========================================

  getAllThreadsForStaff: async (): Promise<ChatThread[]> => {
    const res = await api.get<{ threads: ChatThread[] }>('/admin/chat/threads');
    return res.threads;
  },

  getThreadMessagesForStaff: async (
    threadId: string
  ): Promise<ChatMessage[]> => {
    const res = await api.get<{ messages: ChatMessage[] }>(
      `/admin/chat/threads/${threadId}/messages`
    );
    return res.messages;
  },

  // ==========================================
  // OPEN THREAD (backend only)
  // ==========================================
  openThread: async (input: {
    clientId: string;
    providerId: string;
    linkedBookingId?: string;
    fallback: {
      clientDisplayName: string;
      clientAvatarGradient?: string;
      providerDisplayName: string;
      providerAvatarGradient?: string;
      providerRating?: number;
      providerCompletedJobs?: number;
      providerCategories?: string[];
      providerVerified?: boolean;
    };
  }): Promise<{ thread: ChatThread; source: 'backend' }> => {
    
    // Directly call the backend
    const thread = await chatService.getOrCreateThread(
      input.clientId,
      input.providerId,
      input.linkedBookingId
    );

    return { thread, source: 'backend' };
  },  
};