// src/hooks/useChatThread.ts
//
// ============================================
// useChatThread — live messages for a single thread
// ============================================
//
// Reads messages from allChat.ts, subscribes to chatApi changes, and
// marks the thread read when the viewer opens it.
//
// Zero-data safe:
//   - threadId === null        → empty state, no subscription
//   - viewerId === null        → never marks read (observer mode)
//   - thread with no messages  → empty list, no crash
//   - unknown threadId         → empty list, no crash

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage } from '../types';
import { getMessagesByThread } from '../utils/allChat';
import { subscribeToChat, markThreadRead, sendMessage } from '../utils/chatApi';

export interface UseChatThreadResult {
  /** Messages for the thread, oldest → newest. Empty array while loading. */
  messages: ChatMessage[];
  /** True while the initial load is in flight. */
  loading: boolean;
  /** Send a message on this thread. No-op if viewerId is null or thread is missing. */
  send: (text: string) => void;
  /** Force a re-read from storage. Rarely needed — subscription handles this. */
  reload: () => void;
}

export const useChatThread = (
  threadId: string | null,
  viewerId: string | null
): UseChatThreadResult => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(() => !!threadId);

  // Track the (threadId, viewerId) pair we've already marked read so we
  // don't re-mark on every render.
  const markedReadForRef = useRef<string | null>(null);

  // ------------------------------------------
  // READ
  // ------------------------------------------
  const reload = useCallback(() => {
    if (!threadId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setMessages(getMessagesByThread(threadId));
    setLoading(false);
  }, [threadId]);

  // Load on mount + whenever the thread changes
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    reload();
  }, [threadId, reload]);

  // Subscribe to chat changes — re-read whenever anyone (any tab) writes
  useEffect(() => {
    if (!threadId) return;
    const unsubscribe = subscribeToChat(() => {
      reload();
    });
    return unsubscribe;
  }, [threadId, reload]);

  // ------------------------------------------
  // MARK READ
  // ------------------------------------------
  // Mark the thread read when:
  //   - a thread + viewer are both present
  //   - we haven't already marked this (thread, viewer) pair
  //   - there is at least one unread message from the other party
  //
  // The markThreadRead call returns the count it updated. If it's zero,
  // we don't consider the thread "marked" — so a later arrival of new
  // messages triggers another mark on the next render.
  useEffect(() => {
    if (!threadId || !viewerId) return;

    const pairKey = `${threadId}::${viewerId}`;
    if (markedReadForRef.current === pairKey) return;

    const updated = markThreadRead(threadId, viewerId);
    if (updated > 0) {
      markedReadForRef.current = pairKey;
      // markThreadRead already fired notifyChatChanged, which triggers
      // our subscription → reload. No manual reload needed.
    }
  }, [threadId, viewerId, messages]); // messages dep so we re-check when new ones arrive

  // ------------------------------------------
  // SEND
  // ------------------------------------------
  const send = useCallback(
    (text: string) => {
      if (!threadId || !viewerId) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      try {
        sendMessage({ threadId, senderId: viewerId, text: trimmed });
        // No local state push — sendMessage fires notifyChatChanged,
        // which our subscription picks up and calls reload().
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    },
    [threadId, viewerId]
  );

  // Stable return shape — prevents downstream re-renders from identity churn
  return useMemo(
    () => ({ messages, loading, send, reload }),
    [messages, loading, send, reload]
  );
};

export default useChatThread;
