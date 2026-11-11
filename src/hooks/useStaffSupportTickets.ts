// src/hooks/useStaffSupportTickets.ts
//
// Fetches the full ticket list once (?status=all) and exposes
// client-side filtered views per tab. Polls every 10s while visible.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StaffSupportTicket } from '../services/staffSupport.service';
import { staffSupportService } from '../services/staffSupport.service';
import { useSseEvent } from './useSseEvent';

export interface UseStaffSupportTicketsResult {
  tickets: StaffSupportTicket[];
  loading: boolean;
  reload: () => void;
}

export const useStaffSupportTickets = (
  enabled: boolean
): UseStaffSupportTicketsResult => {
  const [tickets, setTickets] = useState<StaffSupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setTickets([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await staffSupportService.getTickets({ status: 'all' });
        if (!cancelled) {
          setTickets(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[staff-support] tickets fetch failed', err);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, refreshTick]);

    useSseEvent('support:ticket:new', () => {
        if (enabled) setRefreshTick((t) => t + 1);
    });
        useSseEvent('support:ticket:updated', () => {
        if (enabled) setRefreshTick((t) => t + 1);
    });
        useSseEvent('support:message:new', () => {
        if (enabled) setRefreshTick((t) => t + 1);
    });

  useEffect(() => {
    if (!enabled) return;
    const onFocus = () => {
      if (document.visibilityState === 'visible') setRefreshTick((t) => t + 1);
    };
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled]);

  const reload = useCallback(() => setRefreshTick((t) => t + 1), []);

  return useMemo(
    () => ({ tickets, loading, reload }),
    [tickets, loading, reload]
  );
};

export default useStaffSupportTickets;