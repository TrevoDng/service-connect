// src/hooks/useMySupportTickets.ts
//
// Polls the requester's ticket list every 10s while visible, and
// refreshes on focus. Pass `null` for `userId` to disable (logged out).

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupportTicket } from '../types';
import { supportService } from '../services/support.service';
import { useSseEvent } from './useSseEvent';

export interface UseMySupportTicketsResult {
  tickets: SupportTicket[];
  loading: boolean;
  reload: () => void;
}

export const useMySupportTickets = (
  userId: string | null
): UseMySupportTicketsResult => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!userId) {
        setTickets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await supportService.getMyTickets();
        if (!cancelled) {
          setTickets(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[support] tickets fetch failed', err);
        if (!cancelled) setLoading(false);
        // Do not wipe existing tickets on transient failures.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, refreshTick]);

  // Poll every 10s while visible
    useSseEvent('support:message:new', () => {
        if (userId) setRefreshTick((t) => t + 1);
        });
    useSseEvent('support:ticket:updated', () => {
        if (userId) setRefreshTick((t) => t + 1);
        });

  // Refresh on focus / tab visibility
  useEffect(() => {
    if (!userId) return;
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
  }, [userId]);

  const reload = useCallback(() => setRefreshTick((t) => t + 1), []);

  return useMemo(
    () => ({ tickets, loading, reload }),
    [tickets, loading, reload]
  );
};

export default useMySupportTickets;