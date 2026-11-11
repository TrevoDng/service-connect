// src/types/support.types.ts
import type { ChatAttachment } from './chat.types';

export type SupportTicketStatus = 'open' | 'claimed' | 'closed';
export type SupportRequesterRole = 'CLIENT' | 'PROVIDER';
export type SupportSenderRole = 'CLIENT' | 'PROVIDER' | 'ADMIN' | 'EMPLOYEE';
export type SupportMessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: SupportSenderRole;
  text: string;
  attachments?: ChatAttachment[];
  sentAt: string; // ISO
  status: SupportMessageStatus;
  readAt?: string;
}

export interface SupportTicket {
  id: string;
  status: SupportTicketStatus;
  subject?: string;
  lastActivityAt: string;
  lastMessagePreview: string;
  autoCloseAt: string;
  closedAt?: string;
  assignedAt?: string;
  /** True when any staff member has claimed it (name hidden from requester). */
  assigned: boolean;
  unreadCount: number;
  createdAt: string;
}

/** Display label for the staff side, shown everywhere the requester sees "who". */
export const SUPPORT_DISPLAY_NAME = 'ServiceConnect Support';

/** Gradient used for the staff avatar bubble. Distinct from client/provider colors. */
export const SUPPORT_AVATAR_GRADIENT =
  'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';