// src/utils/chatApi.ts
//
// ============================================
// CHAT WRITE API + CHANGE NOTIFICATIONS
// ============================================
//
// The only module that mutates chat data. Everything else (allChat.ts,
// hooks, components) treats chat as read-only and lets this file handle
// writes.
//
// Responsibilities:
//   - getOrCreateThread  (lazy thread creation for a client↔provider pair)
//   - sendMessage        (append a message + update thread metadata)
//   - markThreadRead     (flip unread → read for a viewer)
//   - deleteThread       (remove a thread + its messages)
//   - subscribeToChat    (cross-tab + same-tab change notifications)
//
// When the backend is ready, each write function becomes an API call.
// subscribeToChat becomes a WebSocket/SSE subscription. The public API
// stays identical — no component change required.

import type { ChatThread, ChatMessage, ChatParticipant } from '../types';
import {
  getLocalThreads,
  upsertLocalThread,
  updateLocalThread,
  removeLocalThread,
  getLocalMessages,
  addLocalMessage,
  removeLocalMessagesByThread,
  markThreadMessagesRead,
} from './localChat';
import { findThreadByParticipants } from './allChat';
import { generateId } from './referenceCode';

// ============================================
// CHANGE NOTIFICATIONS
// ============================================
//
// Two channels, one subscriber API:
//
//   1. `storage` event  → fires in OTHER tabs when localStorage changes
//   2. local EventTarget → fires in THIS tab when we mutate
//
// A subscriber registered via subscribeToChat() listens to both. It gets
// no payload — just "something changed, go re-read". This keeps callers
// stateless and matches how a WebSocket server will behave later.

const CHAT_CHANGED_EVENT = 'serviceconnect:chat-changed';

// Internal EventTarget for same-tab notifications.
// Not exported — callers use subscribeToChat() instead.
const localBus: EventTarget =
  typeof window !== 'undefined' ? new EventTarget() : new EventTarget();

/** Fire a change notification on both channels (same-tab + other-tabs). */
const notifyChatChanged = (): void => {
  try {
    localBus.dispatchEvent(new Event(CHAT_CHANGED_EVENT));
  } catch (err) {
    console.error('Failed to dispatch local chat change event:', err);
  }
};

/** Handle the browser `storage` event for other-tab changes. */
const handleStorageEvent = (event: StorageEvent): void => {
  if (!event.key) return;
  if (
    event.key === 'serviceconnect-chat-threads' ||
    event.key === 'serviceconnect-chat-messages'
  ) {
    notifyChatChanged();
  }
};

/**
 * Subscribe to chat changes. Returns an unsubscribe function.
 *
 * The callback receives no arguments — it should re-read whatever it
 * cares about (thread list, message list, unread count).
 *
 * Fires:
 *   - when this tab writes chat data (send, mark-read, create thread…)
 *   - when ANOTHER tab writes chat data (via the `storage` event)
 */
export const subscribeToChat = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  // Same-tab channel
  const localHandler = () => callback();
  localBus.addEventListener(CHAT_CHANGED_EVENT, localHandler);

  // Other-tab channel — only attach once for all subscribers
  // (see ref-counted attach below)
  attachGlobalStorageListener();

  return () => {
    localBus.removeEventListener(CHAT_CHANGED_EVENT, localHandler);
    detachGlobalStorageListener();
  };
};

// ============================================
// STORAGE LISTENER REF-COUNT
// ============================================
//
// Attach the browser storage listener only while at least one subscriber
// exists. This avoids leaving a stray listener if the app unmounts.

let storageListenerRefCount = 0;

const attachGlobalStorageListener = (): void => {
  if (typeof window === 'undefined') return;
  storageListenerRefCount += 1;
  if (storageListenerRefCount === 1) {
    window.addEventListener('storage', handleStorageEvent);
  }
};

const detachGlobalStorageListener = (): void => {
  if (typeof window === 'undefined') return;
  storageListenerRefCount = Math.max(0, storageListenerRefCount - 1);
  if (storageListenerRefCount === 0) {
    window.removeEventListener('storage', handleStorageEvent);
  }
};

// ============================================
// THREAD CREATION
// ============================================

interface ParticipantInput {
  clientId: string;
  clientDisplayName: string;
  clientAvatarGradient?: string;
  providerId: string;
  providerDisplayName: string;
  providerAvatarGradient?: string;
  /** Optional provider trust fields to seed the participant snapshot. */
  providerRating?: number;
  providerCompletedJobs?: number;
  providerCategories?: string[];
  providerVerified?: boolean;
}

const DEFAULT_CLIENT_GRADIENT =
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const DEFAULT_PROVIDER_GRADIENT =
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';

const buildClientParticipant = (input: ParticipantInput): ChatParticipant => ({
  userId: input.clientId,
  displayName: input.clientDisplayName,
  role: 'CLIENT',
  avatarGradient: input.clientAvatarGradient ?? DEFAULT_CLIENT_GRADIENT,
});

const buildProviderParticipant = (input: ParticipantInput): ChatParticipant => ({
  userId: input.providerId,
  displayName: input.providerDisplayName,
  role: 'PROVIDER',
  avatarGradient: input.providerAvatarGradient ?? DEFAULT_PROVIDER_GRADIENT,
  providerRating: input.providerRating,
  providerCompletedJobs: input.providerCompletedJobs,
  providerCategories: input.providerCategories,
  providerVerified: input.providerVerified,
});

/**
 * Return the existing thread between a client and a provider, or create
 * a new one. The returned thread is the stored version — safe to render.
 *
 * Threads are lazy: they only exist once someone has messaged. Calling
 * this from a "Message provider" button before any message is sent will
 * create an empty thread — that's intentional, so the composer has a
 * threadId to attach the first message to.
 *
 * Throws if either id is missing — a programming error, not a data error.
 */
export const getOrCreateThread = (input: ParticipantInput): ChatThread => {
  if (!input.clientId || !input.providerId) {
    throw new Error(
      'getOrCreateThread requires both clientId and providerId'
    );
  }

  const existing = findThreadByParticipants(input.clientId, input.providerId);
  if (existing) return existing;

  const now = new Date().toISOString();

  const thread: ChatThread = {
    id: generateId(),
    clientId: input.clientId,
    providerId: input.providerId,
    client: buildClientParticipant(input),
    provider: buildProviderParticipant(input),
    createdAt: now,
    lastMessageAt: now,
    lastMessagePreview: '',
    unreadCount: 0, // stored field kept for type compatibility; UI reads computed values
  };

  upsertLocalThread(thread);
  notifyChatChanged();
  return thread;
};

// ============================================
// SEND MESSAGE
// ============================================

export interface SendMessageInput {
  threadId: string;
  senderId: string;
  text: string;
  /** Optional attachments (images already uploaded and returned as URLs). */
  attachments?: ChatMessage['attachments'];
}

/**
 * Append a message to a thread and bump the thread's metadata.
 *
 * - Message is stored with status `'sent'`. Delivery/read transitions
 *   happen later, when the recipient actually opens the thread.
 * - Thread's `lastMessageAt` and `lastMessagePreview` are refreshed so
 *   the thread list can sort and preview without loading messages.
 * - Returns the created message so the caller can optimistically render it.
 *
 * Throws if the thread doesn't exist — threads must be created first via
 * getOrCreateThread(). This is deliberate: sendMessage should never
 * invent a thread without participant details.
 */
export const sendMessage = (input: SendMessageInput): ChatMessage => {
  const { threadId, senderId, text, attachments } = input;

  if (!threadId || !senderId) {
    throw new Error('sendMessage requires threadId and senderId');
  }

  const trimmed = text.trim();
  const hasAttachments = !!attachments && attachments.length > 0;

  if (!trimmed && !hasAttachments) {
    throw new Error('sendMessage requires non-empty text or attachments');
  }

  const thread = getLocalThreads().find((t) => t.id === threadId);
  if (!thread) {
    throw new Error(`Cannot send message — thread ${threadId} not found`);
  }

  const now = new Date().toISOString();

  const message: ChatMessage = {
    id: generateId(),
    threadId,
    senderId,
    text: trimmed,
    attachments: hasAttachments ? attachments : undefined,
    sentAt: now,
    status: 'sent',
  };

  addLocalMessage(message);

  // Keep the thread's last-activity fields fresh so the thread list is
  // always correct without needing to scan messages for it.
  const preview =
    trimmed.length > 0
      ? trimmed.length > 80
        ? `${trimmed.slice(0, 77)}…`
        : trimmed
      : hasAttachments
      ? attachments!.length === 1
        ? '📎 Attachment'
        : `📎 ${attachments!.length} attachments`
      : '';

  updateLocalThread(threadId, {
    lastMessageAt: now,
    lastMessagePreview: preview,
  });

  notifyChatChanged();
  return message;
};

// ============================================
// MARK READ
// ============================================

/**
 * Mark every message in a thread as read for a given viewer.
 * Skips the viewer's own messages (see markThreadMessagesRead in
 * localChat.ts for why).
 *
 * Returns the number of messages that transitioned to `read`.
 * Zero is a valid, non-error result — the thread may already be read.
 */
export const markThreadRead = (
  threadId: string,
  viewerId: string
): number => {
  if (!threadId || !viewerId) return 0;
  const updated = markThreadMessagesRead(threadId, viewerId);
  if (updated > 0) notifyChatChanged();
  return updated;
};

// ============================================
// DELETE THREAD
// ============================================

/**
 * Remove a thread and all of its messages.
 * No-op if the thread doesn't exist.
 *
 * Not currently used by the UI, but exposed so a future "delete chat"
 * button has a clean entry point. When the backend arrives, this becomes
 * a DELETE request.
 */
export const deleteThread = (threadId: string): void => {
  if (!threadId) return;
  const thread = getLocalThreads().find((t) => t.id === threadId);
  if (!thread) return;
  removeLocalThread(threadId);
  removeLocalMessagesByThread(threadId);
  notifyChatChanged();
};

// ============================================
// DEBUG / TESTING HELPERS
// ============================================
//
// Small utilities used by dev tooling or tests. Kept exported so nothing
// has to reach into localStorage directly.

/**
 * All messages currently in storage, unsorted.
 * Mostly for tests and debugging — production code should use
 * allChat.getMessagesByThread().
 */
export const _debugGetAllMessages = (): ChatMessage[] => getLocalMessages();

/**
 * Force a change notification without writing anything.
 * Useful in tests to simulate "another tab changed something".
 */
export const _debugNotifyChange = (): void => notifyChatChanged();
