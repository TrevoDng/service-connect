// src/utils/activeThreadTracker.ts
//
// Tracks which chat thread each user currently has open, so we can
// suppress notifications for messages they're already looking at.
//
// In-memory only — this is per-tab state, not something that needs to
// survive a refresh. If the page reloads, we assume the user isn't
// watching any thread until ChatPanel registers one.
//
// No subscription, no reactivity. Just a fast lookup.

const activeThreadByUser = new Map<string, string>();

export const setActiveThread = (userId: string, threadId: string): void => {
  activeThreadByUser.set(userId, threadId);
};

export const clearActiveThread = (userId: string): void => {
  activeThreadByUser.delete(userId);
};

export const isThreadActiveForUser = (
  userId: string,
  threadId: string
): boolean => {
  return activeThreadByUser.get(userId) === threadId;
};
