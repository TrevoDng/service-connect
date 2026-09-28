// src/hooks/useChatThreads.ts
//
// ============================================
// useChatThreads — live thread list for a user
// ============================================
//
// Reads the user's thread list from allChat.ts and subscribes to chat
// changes so the list stays fresh across tabs.
//
// Deliberately does NOT mark anything read — opening the sidebar should
// not clear unread badges. Read transitions happen in useChatThread
// when the user actually opens a conversation.
//
// Zero-data safe:
//   - userId === null          → empty list, no subscription
//   - observerMode === true    → returns ALL threads, unreadCount: 0
//   - no threads in storage    → empty list, no crash

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChatThread } from '../types';
import { getThreadsForUser, getAllThreads } from '../utils/allChat';
import { subscribeToChat } from '../utils/chatApi';

export interface UseChatThreadsOptions {
  /** Support/observer mode — returns every thread, ignores userId. */
  observerMode?: boolean;
}

export interface UseChatThreadsResult {
  /** Threads sorted newest activity first. Empty array while loading. */
  threads: ChatThread[];
  /** True while the initial load is in flight. */
  loading: boolean;
  /** Force a re-read from storage. Rarely needed — subscription handles this. */
  reload: () => void;
}

export const useChatThreads = (
  userId: string | null,
  options: UseChatThreadsOptions = {}
): UseChatThreadsResult => {
  const { observerMode = false } = options;
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState<boolean>(() =>
    observerMode ? true : !!userId
  );

  // ------------------------------------------
  // READ
  // ------------------------------------------
  const reload = useCallback(() => {
    if (observerMode) {
      setThreads(getAllThreads());
      setLoading(false);
      return;
    }
    if (!userId) {
      setThreads([]);
      setLoading(false);
      return;
    }
    setThreads(getThreadsForUser(userId));
    setLoading(false);
  }, [userId, observerMode]);

  // Load on mount + whenever userId or observer mode changes
  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  // Subscribe to chat changes — re-read whenever anyone (any tab) writes
  useEffect(() => {
    const unsubscribe = subscribeToChat(() => {
      reload();
    });
    return unsubscribe;
  }, [reload]);

  return useMemo(
    () => ({ threads, loading, reload }),
    [threads, loading, reload]
  );
};

export default useChatThreads;
