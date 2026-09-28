// src/utils/allChat.ts
//
// ============================================
// CHAT READ API
// ============================================
//
// Stateless, read-only facade over localChat.ts. Every function:
//   - reads fresh from localStorage (no caching here — hooks do that)
//   - returns empty arrays / undefined instead of throwing
//   - computes derived values (like unreadCount) rather than trusting
//     stored ones, because a single stored unreadCount cannot represent
//     two different viewers of the same thread
//
// This mirrors the shape of src/utils/allBookings.ts — the read-side
// sibling of localBookings.ts. When the backend is ready, each function
// becomes an API call. Signatures stay identical.

import type { ChatThread, ChatMessage } from '../types';
import { getLocalThreads, getLocalMessages } from './localChat';

// ============================================
// INTERNAL HELPERS
// ============================================

/**
 * Compute the unread count for a given viewer in a given thread.
 * A message counts as unread when:
 *   - it belongs to the thread
 *   - it was NOT sent by the viewer
 *   - its status is not yet 'read'
 *
 * Returns 0 for empty threads, unknown viewers, or fully-read threads.
 */
const computeUnreadCount = (
  threadId: string,
  viewerUserId: string,
  allMessages: ChatMessage[]
): number => {
  if (!threadId || !viewerUserId) return 0;
  return allMessages.reduce((count, m) => {
    if (m.threadId !== threadId) return count;
    if (m.senderId === viewerUserId) return count;
    if (m.status === 'read') return count;
    return count + 1;
  }, 0);
};

/**
 * Build the last-message preview string for a thread.
 * Used when the stored `lastMessagePreview` is missing or stale.
 */
const buildPreview = (message: ChatMessage | undefined): string => {
  if (!message) return '';
  const text = message.text?.trim() ?? '';
  if (text) return text.length > 80 ? `${text.slice(0, 77)}…` : text;
  if (message.attachments && message.attachments.length > 0) {
    return message.attachments.length === 1
      ? '📎 Attachment'
      : `📎 ${message.attachments.length} attachments`;
  }
  return '';
};

/**
 * Enrich a raw thread with fresh, viewer-specific derived fields.
 * The stored thread object is NOT mutated — a shallow copy is returned.
 *
 * If `viewerUserId` is null, unreadCount is 0 (no viewer to compute for).
 */
const enrichThread = (
  thread: ChatThread,
  viewerUserId: string | null,
  allMessages: ChatMessage[]
): ChatThread => {
  const threadMessages = allMessages.filter((m) => m.threadId === thread.id);

  // Most recent message in the thread (for preview + lastMessageAt fallback)
  const latest = threadMessages.length
    ? threadMessages.reduce((newest, m) =>
        new Date(m.sentAt).getTime() > new Date(newest.sentAt).getTime()
          ? m
          : newest
      )
    : undefined;

  return {
    ...thread,
    lastMessageAt: latest?.sentAt ?? thread.lastMessageAt,
    lastMessagePreview:
      buildPreview(latest) || thread.lastMessagePreview || '',
    unreadCount: viewerUserId
      ? computeUnreadCount(thread.id, viewerUserId, allMessages)
      : 0,
  };
};

// ============================================
// THREAD LOOKUPS
// ============================================

/**
 * Find the thread between a client and a provider.
 * Threads are unique per (clientId, providerId) pair.
 *
 * Returns `undefined` when no thread exists — callers should treat that
 * as "not yet started", NOT as an error.
 */
export const findThreadByParticipants = (
  clientId: string,
  providerId: string
): ChatThread | undefined => {
  if (!clientId || !providerId) return undefined;
  const threads = getLocalThreads();
  return threads.find(
    (t) => t.clientId === clientId && t.providerId === providerId
  );
};

/**
 * Look up a thread by its id. Returns `undefined` if not found.
 */
export const getThreadById = (id: string): ChatThread | undefined => {
  if (!id) return undefined;
  return getLocalThreads().find((t) => t.id === id);
};

// ============================================
// THREAD LISTS
// ============================================

/**
 * Threads where the given user is either the client or the provider.
 * Returns them enriched with viewer-specific unread counts, sorted by
 * most recent activity.
 *
 * Returns `[]` for null/empty userId — no guessing.
 */
export const getThreadsForUser = (
  userId: string | null,
  _role?: 'CLIENT' | 'PROVIDER'
): ChatThread[] => {
  if (!userId) return [];
  const threads = getLocalThreads();
  const messages = getLocalMessages();

  return threads
    .filter((t) => t.clientId === userId || t.providerId === userId)
    .map((t) => enrichThread(t, userId, messages))
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );
};

/**
 * Every thread in storage — used by observer / support mode.
 * Enriched with `unreadCount: 0` because an observer has no "inbox".
 * Sorted newest activity first.
 */
export const getAllThreads = (): ChatThread[] => {
  const threads = getLocalThreads();
  const messages = getLocalMessages();
  return threads
    .map((t) => enrichThread(t, null, messages))
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );
};

// ============================================
// MESSAGE LOOKUPS
// ============================================

/**
 * All messages in a thread, oldest → newest.
 * Returns `[]` when the thread is unknown or has no messages.
 */
export const getMessagesByThread = (threadId: string): ChatMessage[] => {
  if (!threadId) return [];
  return getLocalMessages()
    .filter((m) => m.threadId === threadId)
    .sort(
      (a, b) =>
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
};

/**
 * Total number of messages in a thread. Useful for empty-state checks
 * that don't want to load the full list.
 */
export const getMessageCountByThread = (threadId: string): number => {
  if (!threadId) return 0;
  return getLocalMessages().filter((m) => m.threadId === threadId).length;
};

// ============================================
// AGGREGATE HELPERS
// ============================================

/**
 * Total unread messages across all threads for a viewer.
 * Powers a future "unread" badge on the Messages nav item.
 */
export const getTotalUnreadForUser = (userId: string | null): number => {
  if (!userId) return 0;
  return getThreadsForUser(userId).reduce(
    (sum, t) => sum + (t.unreadCount ?? 0),
    0
  );
};

/**
 * True when there is at least one thread in storage.
 * Cheaper than calling getAllThreads and checking length for large datasets.
 */
export const hasAnyThreads = (): boolean => getLocalThreads().length > 0;
