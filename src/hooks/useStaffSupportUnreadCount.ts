// src/hooks/useStaffSupportUnreadCount.ts
//
// Badge count for staff: unclaimed tickets + tickets I've claimed with
// unread messages. Refreshes on SSE + focus.

import { useCallback, useEffect, useState } from 'react';
import { staffSupportService } from '../services/staffSupport.service';
import { useSseEvent } from './useSseEvent';

export function useStaffSupportUnreadCount(viewerId: string | null): number {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!viewerId) { setCount(0); return; }
    try {
      const tickets = await staffSupportService.getTickets({ status: 'all' });
      const n = tickets.filter(
        (t) =>
          t.status !== 'closed' &&
          (!t.assignedStaffId || (t.isMine && t.unreadCount > 0))
      ).length;
      setCount(n);
    } catch { /* keep last value */ }
  }, [viewerId]);

  useEffect(() => {
    if (!viewerId) { setCount(0); return; }
    void refresh();
  }, [viewerId, refresh]);

  useSseEvent('support:ticket:new', () => { void refresh(); });
  useSseEvent('support:ticket:updated', () => { void refresh(); });
  useSseEvent('support:message:new', () => { void refresh(); });

  useEffect(() => {
    if (!viewerId) return;
    const onFocus = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, [viewerId, refresh]);

  return count;
}