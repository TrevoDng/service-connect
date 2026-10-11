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
//
// Send does NOT push notifications itself. Instead it invokes the
// optional `onSent` callback with the freshly created message plus the
// thread it belongs to. The consumer (ChatPanel) owns whether and how
// to notify — keeping this hook free of notification-context coupling.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage, ChatThread } from '../types';
import { getMessagesByThread, getThreadById } from '../utils/allChat';
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

export interface UseChatThreadOptions {
  /**
   * Fired after a message has been successfully written. The consumer
   * decides whether to notify anyone. Never fires in observer mode
   * (viewerId === null).
   */
  onSent?: (thread: ChatThread, message: ChatMessage) => void;
}

export const useChatThread = (
  threadId: string | null,
  viewerId: string | null,
  options: UseChatThreadOptions = {}
): UseChatThreadResult => {
  const { onSent } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(() => !!threadId);

  // Track the (threadId, viewerId) pair we've already marked read so we
  // don't re-mark on every render.
  const markedReadForRef = useRef<string | null>(null);

  // Keep a live ref to onSent so `send` doesn't need to re-create
  // whenever the caller's callback identity changes.
  const onSentRef = useRef(onSent);
  useEffect(() => {
    onSentRef.current = onSent;
  }, [onSent]);

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

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    reload();
  }, [threadId, reload]);

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
  useEffect(() => {
    if (!threadId || !viewerId) return;

    const pairKey = `${threadId}::${viewerId}`;
    if (markedReadForRef.current === pairKey) return;

    const updated = markThreadRead(threadId, viewerId);
    if (updated > 0) {
      markedReadForRef.current = pairKey;
    }
  }, [threadId, viewerId, messages]);

  // ------------------------------------------
  // SEND
  // ------------------------------------------
  const send = useCallback(
    (text: string) => {
      if (!threadId || !viewerId) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      try {
        const message = sendMessage({
          threadId,
          senderId: viewerId,
          text: trimmed,
        });

        // Hand off to the consumer for any notification logic.
        // Failures here must not break message delivery.
        if (onSentRef.current && message) {
          const thread = getThreadById(threadId);
          if (thread) {
            try {
              onSentRef.current(thread, message);
            } catch (cbErr) {
              console.error('onSent callback threw:', cbErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    },
    [threadId, viewerId]
  );

  return useMemo(
    () => ({ messages, loading, send, reload }),
    [messages, loading, send, reload]
  );
};

export default useChatThread;
