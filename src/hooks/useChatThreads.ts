// src/hooks/useChatThreads.ts
//
// ============================================
// useChatThreads — thread list for a viewer
// ============================================
//
// Reads from the backend (chat.service) for real users, and falls back
// to localStorage for demo users when the backend is unreachable.
//
// Polls every 10s while the tab is visible; refreshes on focus.
//
// Zero-data safe:
//   - userId === null + not observer  → empty list, no fetch
//   - observerMode === true            → hits /admin/chat/threads
//   - backend down                     → falls back to local demo threads

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChatThread } from '../types';
import { chatService } from '../services/chat.service';

export interface UseChatThreadsOptions {
  observerMode?: boolean;
}

export interface UseChatThreadsResult {
  threads: ChatThread[];
  loading: boolean;
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
  const [refreshTick, setRefreshTick] = useState(0);

  // ------------------------------------------
  // LOAD
  // ------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Not logged in and not observing → no-op
      if (!observerMode && !userId) {
        setThreads([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = observerMode
          ? await chatService.getAllThreadsForStaff()
          : await chatService.getMyThreads();
        if (!cancelled) {
          setThreads(data);
          setLoading(false);
        }
       } catch (err) {
        console.warn('[chat] backend threads fetch failed', err);
        if (!cancelled) {
          setThreads([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, observerMode, refreshTick]);

  // ------------------------------------------
  // POLL every 10s while visible
  // ------------------------------------------
  useEffect(() => {
    if (!observerMode && !userId) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setRefreshTick((t) => t + 1);
      }
    }, 10_000);
    return () => window.clearInterval(id);
  }, [observerMode, userId]);

  // ------------------------------------------
  // REFRESH ON FOCUS
  // ------------------------------------------
  useEffect(() => {
    if (!observerMode && !userId) return;
    const onFocus = () => {
      if (document.visibilityState === 'visible') {
        setRefreshTick((t) => t + 1);
      }
    };
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, [observerMode, userId]);

  const reload = useCallback(() => setRefreshTick((t) => t + 1), []);

  return useMemo(
    () => ({ threads, loading, reload }),
    [threads, loading, reload]
  );
};

export default useChatThreads;