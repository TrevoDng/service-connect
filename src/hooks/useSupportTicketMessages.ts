// src/hooks/useSupportTicketMessages.ts
//
// Messages for one ticket. Polls every 5s, auto-marks staff messages
// read on first load, and returns an async `send` that appends the
// new message optimistically.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupportMessage, ChatAttachment } from '../types';
import { supportService } from '../services/support.service';
import { useSseEvent } from './useSseEvent';

export interface UseSupportTicketMessagesResult {
  messages: SupportMessage[];
  loading: boolean;
  send: (text: string, attachments?: ChatAttachment[]) => Promise<void>;
  reload: () => void;
}

export const useSupportTicketMessages = (
  ticketId: string | null,
  viewerId: string | null
): UseSupportTicketMessagesResult => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(!!ticketId);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!ticketId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await supportService.getTicketMessages(ticketId);
        if (cancelled) return;
        setMessages(data);
        setLoading(false);

        // Auto-mark read — only for staff-authored messages we haven't read.
        if (viewerId) {
          const hasUnread = data.some(
            (m) =>
              m.senderId !== viewerId &&
              (m.senderRole === 'ADMIN' || m.senderRole === 'EMPLOYEE') &&
              m.status !== 'read'
          );
          if (hasUnread) {
            supportService
              .markRead(ticketId)
              .catch((err) => console.warn('[support] mark read failed', err));
          }
        }
      } catch (err) {
        console.warn('[support] messages fetch failed', err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ticketId, viewerId, refreshTick]);

  // Poll every 5s while visible
    useSseEvent('support:message:new', (data) => {
        if (!ticketId) return;
        // Only refresh if this event is for our ticket
        const payload = data as { ticketId?: string } | null;
        if (payload?.ticketId === ticketId) {
            setRefreshTick((t) => t + 1);
        }
    });

  const send = useCallback(
    async (text: string, attachments?: ChatAttachment[]) => {
      if (!ticketId || !viewerId) return;
      const trimmed = text.trim();
      const hasAtt = !!attachments && attachments.length > 0;
      if (!trimmed && !hasAtt) return;

      try {
        const message = await supportService.sendMessage(
          ticketId,
          trimmed,
          attachments
        );

        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      } catch (err) {
        console.error('[support] send failed', err);
        throw err;
      }
    },
    [ticketId, viewerId]
  );

  const reload = useCallback(() => setRefreshTick((t) => t + 1), []);

  return useMemo(
    () => ({ messages, loading, send, reload }),
    [messages, loading, send, reload]
  );
};

export default useSupportTicketMessages;