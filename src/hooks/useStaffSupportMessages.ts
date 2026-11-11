// src/hooks/useStaffSupportMessages.ts
//
// Messages + send for a single ticket. Same shape as the requester hook
// but hits the staff endpoints and does NOT auto-mark read (the panel
// calls markRead explicitly, so non-assignee watchers don't wipe badges).

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupportMessage, ChatAttachment } from '../types';
import { staffSupportService } from '../services/staffSupport.service';
import { useSseEvent } from './useSseEvent';

export interface UseStaffSupportMessagesResult {
  messages: SupportMessage[];
  loading: boolean;
  send: (text: string, attachments?: ChatAttachment[]) => Promise<void>;
  reload: () => void;
}

export const useStaffSupportMessages = (
  ticketId: string | null
): UseStaffSupportMessagesResult => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(!!ticketId);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await staffSupportService.getMessages(ticketId);
        if (!cancelled) {
          setMessages(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[staff-support] messages fetch failed', err);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ticketId, refreshTick]);

    useSseEvent('support:message:new', (data) => {
        if (!ticketId) return;
        const payload = data as { ticketId?: string } | null;
        if (payload?.ticketId === ticketId) {
            setRefreshTick((t) => t + 1);
        }
    });

  const send = useCallback(
    async (text: string, attachments?: ChatAttachment[]) => {
      if (!ticketId) return;
      const trimmed = text.trim();
      const hasAtt = !!attachments && attachments.length > 0;
      if (!trimmed && !hasAtt) return;

      try {
        const message = await staffSupportService.sendMessage(
          ticketId,
          trimmed,
          attachments
        );
        setMessages((prev) =>
          prev.some((m) => m.id === message.id) ? prev : [...prev, message]
        );
      } catch (err) {
        console.error('[staff-support] send failed', err);
        throw err;
      }
    },
    [ticketId]
  );

  const reload = useCallback(() => setRefreshTick((t) => t + 1), []);

  return useMemo(
    () => ({ messages, loading, send, reload }),
    [messages, loading, send, reload]
  );
};

export default useStaffSupportMessages;