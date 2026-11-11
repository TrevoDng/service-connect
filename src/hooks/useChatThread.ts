// src/hooks/useChatThread.ts
//
// ============================================
// useChatThread — messages for a single thread
// ============================================
//
// Reads from backend; falls back to localStorage on failure.
// Polls every 5s while visible.
// Auto-marks messages read when the viewer opens the thread.
//
// `send` is now async (was sync). The composer doesn't await it —
// it's optimistic-updated into local state as soon as the API returns.
//
// `observerMode` picks the staff endpoints — needed because staff are
// not participants of any thread, so the participant-only endpoints
// would reject them.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage, ChatThread, ChatAttachment } from '../types';
import { chatService } from '../services/chat.service';
import { useSseEvent } from './useSseEvent';

export interface UseChatThreadResult {
  messages: ChatMessage[];
  loading: boolean;
  send: (text: string, attachments?: ChatAttachment[]) => Promise<void>; // <-- Update signature
  reload: () => void;
}

export interface UseChatThreadOptions {
  onSent?: (thread: ChatThread, message: ChatMessage) => void;
  observerMode?: boolean;
}

export const useChatThread = (
  threadId: string | null,
  viewerId: string | null,
  options: UseChatThreadOptions = {}
): UseChatThreadResult => {
  const { onSent, observerMode = false } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(() => !!threadId);
  const [refreshTick, setRefreshTick] = useState(0);

  const onSentRef = useRef(onSent);
  useEffect(() => {
    onSentRef.current = onSent;
  }, [onSent]);

  // ------------------------------------------
  // LOAD MESSAGES
  // ------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!threadId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = observerMode
          ? await chatService.getThreadMessagesForStaff(threadId)
          : await chatService.getThreadMessages(threadId);

        if (!cancelled) {
          setMessages(data);
          setLoading(false);

          // Mark read (fire-and-forget) — only for real viewers, never
          // for staff observers (they have no "inbox" to clear).
          if (!observerMode && viewerId) {
            const hasUnread = data.some(
              (m) => m.senderId !== viewerId && m.status !== 'read'
            );
            if (hasUnread) {
              chatService.markThreadRead(threadId).catch((err) =>
                console.warn('[chat] mark read failed', err)
              );
            }
          }
        }
      } catch (err) {
        console.warn('[chat] backend messages fetch failed', err);
        if (!cancelled) {
          setMessages([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [threadId, viewerId, observerMode, refreshTick]);

  // ------------------------------------------
  // POLL every 5s while visible but now it is REAL-TIME (SSE)
  // ------------------------------------------
  useSseEvent('chat:message:new', (data) => {
    if (!threadId) return;
    const p = data as { threadId?: string } | null;
    if (p?.threadId === threadId) setRefreshTick((t) => t + 1);
  });

  useSseEvent('chat:thread:read', (data) => {
    if (!threadId) return;
    const p = data as { threadId?: string } | null;
    if (p?.threadId === threadId) setRefreshTick((t) => t + 1);
  });

  // ------------------------------------------
  // SEND (async, optimistic)
  // ------------------------------------------
  const send = useCallback(
    async (text: string, attachments?: ChatAttachment[]) => { // <-- Add attachments
      if (!threadId || !viewerId) return;
      const trimmed = text.trim();
      // Allow sending if there is text OR attachments
      if (!trimmed && (!attachments || attachments.length === 0)) return; 

      try {
        let message: ChatMessage;
        try {
          message = await chatService.sendMessage(threadId, trimmed, attachments);
        } catch (err) {
          console.warn('[chat] backend send failed', err);
          throw err;
        }

        // Optimistic append (avoids waiting for the next poll)
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    },
    [threadId, viewerId]
  );

  const reload = useCallback(() => setRefreshTick((t) => t + 1), []);

  return useMemo(
    () => ({ messages, loading, send, reload }),
    [messages, loading, send, reload]
  );
};

export default useChatThread;