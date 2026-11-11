// src/hooks/useSupportUnreadCount.ts
//
// Total unread messages across the current user's support tickets.
// Refreshes on SSE events + window focus.

import { useCallback, useEffect, useState } from 'react';
import { supportService } from '../services/support.service';
import { useSseEvent } from './useSseEvent';

export function useSupportUnreadCount(userId: string | null): number {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!userId) { setCount(0); return; }
    try {
      const tickets = await supportService.getMyTickets();
      setCount(tickets.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0));
    } catch { /* keep last value */ }
  }, [userId]);

  useEffect(() => {
    if (!userId) { setCount(0); return; }
    void refresh();
  }, [userId, refresh]);

  useSseEvent('support:message:new', () => { void refresh(); });
  useSseEvent('support:ticket:updated', () => { void refresh(); });

  useEffect(() => {
    if (!userId) return;
    const onFocus = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, [userId, refresh]);

  return count;
}