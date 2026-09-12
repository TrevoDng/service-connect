// src/types/chat.types.ts

// ============================================
// CHAT SCOPE
// ============================================
//
// A thread is scoped to a (client, provider) pair. It can exist BEFORE any
// booking is created — clients can chat with multiple providers to compare.
//
// Threads are NOT tied to a booking. A client may start a booking later from
// the same provider via the "Book This Provider" button in the thread view.
//

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface ChatAttachment {
  id: string;
  url: string;
  type: 'image' | 'file';
  name?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  attachments?: ChatAttachment[];
  sentAt: string;           // ISO
  status: MessageStatus;
  readAt?: string;
}

export interface ChatParticipant {
  userId: string;
  displayName: string;
  avatarGradient?: string;   // optional per-role color for the avatar circle
  role: 'CLIENT' | 'PROVIDER';
  // Provider-only — shown to the client for trust
  providerRating?: number;
  providerCompletedJobs?: number;
  providerCategories?: string[];
  providerVerified?: boolean;
}

export interface ChatThread {
  id: string;
  clientId: string;
  providerId: string;
  client: ChatParticipant;
  provider: ChatParticipant;

  createdAt: string;
  lastMessageAt: string;
  lastMessagePreview?: string;
  unreadCount: number;      // relative to the current viewer

  // Optional link to a booking once the client books this provider
  linkedBookingId?: string;
}
