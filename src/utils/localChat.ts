// src/utils/localChat.ts
//
// ============================================
// LOCAL CHAT STORAGE
// ============================================
//
// Pure read/write layer over localStorage for chat threads and messages.
// Mirrors the shape of src/utils/localBookings.ts so the codebase stays
// consistent.
//
// This file contains NO business logic:
//   - no thread lookup by participants (that's allChat.ts)
//   - no send/markRead orchestration (that's chatApi.ts)
//   - no cross-tab subscriptions (that's chatApi.ts)
//
// Everything here is synchronous, JSON-safe, and returns empty arrays/maps
// instead of throwing. When the backend is ready, replace the internals
// of each function with API calls — the signatures stay identical.

import type { ChatThread, ChatMessage } from '../types';

// ============================================
// STORAGE KEYS
// ============================================
//
// Two keys, one per entity type. Separating threads from messages means
// we can read/write a single message without rewriting every thread, and
// vice versa. When the backend is ready, these become two API endpoints.

const THREADS_KEY = 'serviceconnect-chat-threads';
const MESSAGES_KEY = 'serviceconnect-chat-messages';

// ============================================
// THREADS — READ
// ============================================

export const getLocalThreads = (): ChatThread[] => {
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out obviously malformed entries so a corrupted key can never
    // crash a render tree downstream.
    return parsed.filter(
      (t): t is ChatThread =>
        !!t &&
        typeof t === 'object' &&
        typeof t.id === 'string' &&
        typeof t.clientId === 'string' &&
        typeof t.providerId === 'string'
    );
  } catch (err) {
    console.error('Failed to read local chat threads:', err);
    return [];
  }
};

// ============================================
// THREADS — WRITE
// ============================================

const writeAllThreads = (threads: ChatThread[]): void => {
  try {
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  } catch (err) {
    console.error('Failed to write local chat threads:', err);
  }
};

/**
 * Insert a new thread, or replace one with the same id.
 * Safe to call when the list is empty.
 */
export const upsertLocalThread = (thread: ChatThread): void => {
  const current = getLocalThreads();
  const index = current.findIndex((t) => t.id === thread.id);
  if (index === -1) {
    writeAllThreads([...current, thread]);
  } else {
    const next = [...current];
    next[index] = { ...current[index], ...thread };
    writeAllThreads(next);
  }
};

/**
 * Patch a thread by id. No-op if the id isn't found.
 */
export const updateLocalThread = (
  id: string,
  patch: Partial<ChatThread>
): void => {
  const current = getLocalThreads();
  const next = current.map((t) => (t.id === id ? { ...t, ...patch } : t));
  writeAllThreads(next);
};

/**
 * Remove a single thread by id. No-op if not found.
 */
export const removeLocalThread = (id: string): void => {
  const current = getLocalThreads();
  writeAllThreads(current.filter((t) => t.id !== id));
};

/**
 * Danger: clears every thread. Does NOT clear messages — call
 * `clearLocalMessages()` too if you want a true wipe.
 */
export const clearLocalThreads = (): void => {
  try {
    localStorage.removeItem(THREADS_KEY);
  } catch (err) {
    console.error('Failed to clear local chat threads:', err);
  }
};

// ============================================
// MESSAGES — READ
// ============================================

export const getLocalMessages = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === 'object' &&
        typeof m.id === 'string' &&
        typeof m.threadId === 'string' &&
        typeof m.senderId === 'string' &&
        typeof m.sentAt === 'string'
    );
  } catch (err) {
    console.error('Failed to read local chat messages:', err);
    return [];
  }
};

/**
 * Messages for a single thread, sorted oldest → newest.
 * Returns `[]` when the thread is unknown or has no messages.
 */
export const getLocalMessagesByThread = (threadId: string): ChatMessage[] => {
  if (!threadId) return [];
  return getLocalMessages()
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
};

// ============================================
// MESSAGES — WRITE
// ============================================

const writeAllMessages = (messages: ChatMessage[]): void => {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to write local chat messages:', err);
  }
};

/**
 * Append a message. Duplicate ids are ignored (idempotent send).
 */
export const addLocalMessage = (message: ChatMessage): void => {
  const current = getLocalMessages();
  if (current.some((m) => m.id === message.id)) return;
  writeAllMessages([...current, message]);
};

/**
 * Patch a single message by id. No-op if the id isn't found.
 */
export const updateLocalMessage = (
  id: string,
  patch: Partial<ChatMessage>
): void => {
  const current = getLocalMessages();
  const next = current.map((m) => (m.id === id ? { ...m, ...patch } : m));
  writeAllMessages(next);
};

/**
 * Mark every message in a thread as `read` — but ONLY messages that were
 * not sent by the reader. Returns the number of messages updated.
 *
 * Why filter by sender? A user opening a thread should not mark their own
 * messages as read by themselves — that would flip the read receipt the
 * *other* party sees.
 */
export const markThreadMessagesRead = (
  threadId: string,
  readerId: string
): number => {
  if (!threadId || !readerId) return 0;
  const now = new Date().toISOString();
  let updated = 0;
  const next = getLocalMessages().map((m) => {
    if (m.threadId !== threadId) return m;
    if (m.senderId === readerId) return m;
    if (m.status === 'read') return m;
    updated += 1;
    return { ...m, status: 'read' as const, readAt: now };
  });
  if (updated > 0) writeAllMessages(next);
  return updated;
};

/**
 * Remove every message belonging to a thread. Used when deleting a thread.
 */
export const removeLocalMessagesByThread = (threadId: string): void => {
  if (!threadId) return;
  const current = getLocalMessages();
  writeAllMessages(current.filter((m) => m.threadId !== threadId));
};

/**
 * Danger: clears every message. Does NOT clear threads.
 */
export const clearLocalMessages = (): void => {
  try {
    localStorage.removeItem(MESSAGES_KEY);
  } catch (err) {
    console.error('Failed to clear local chat messages:', err);
  }
};

// ============================================
// COMBINED WIPE
// ============================================
//
// Convenience for dev/logout flows that want a clean slate.

export const clearAllLocalChat = (): void => {
  clearLocalThreads();
  clearLocalMessages();
};
