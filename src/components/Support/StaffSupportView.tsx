// src/components/Support/StaffSupportView.tsx
//
// Staff list + panel. Mirrors DisputesView layout (tabs, search, list →
// detail). Reads ?ticket= as a hint from notification deep-links.

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../account/context/AuthContext';
import { useStaffSupportTickets } from '../../hooks/useStaffSupportTickets';
import type { StaffSupportTicket } from '../../services/staffSupport.service';
import { formatRelative, truncate } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faHeadset,
  faChevronRight,
  faCheckCircle,
  faHourglassHalf,
} from '@fortawesome/free-solid-svg-icons';
import { StaffSupportPanel } from './StaffSupportPanel';
import styles from './StaffSupportView.module.scss';

type Tab = 'open' | 'claimed' | 'closed' | 'all';

const statusLabel = (s: StaffSupportTicket['status']): string => {
  if (s === 'open') return 'Open';
  if (s === 'claimed') return 'Claimed';
  return 'Closed';
};

export interface StaffSupportViewProps {
  viewerRole: 'ADMIN' | 'EMPLOYEE';
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase() || '?';
};

export const StaffSupportView: React.FC<StaffSupportViewProps> = ({ viewerRole }) => {
  const { user } = useAuth();
  const viewerId = user?.id ?? '';
  const [searchParams] = useSearchParams();
  const ticketIdFromUrl = searchParams.get('ticket');

  const { tickets, reload } = useStaffSupportTickets(!!viewerId);

  const [activeTab, setActiveTab] = useState<Tab>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Deep-link from notification
  useEffect(() => {
    if (!ticketIdFromUrl) return;
    if (!tickets.some((t) => t.id === ticketIdFromUrl)) return;
    if (selectedTicketId === ticketIdFromUrl) return;
    setSelectedTicketId(ticketIdFromUrl);
    // Switch tab to whichever bucket this ticket is in
    const t = tickets.find((x) => x.id === ticketIdFromUrl);
    if (t) {
      if (t.status === 'open') setActiveTab('open');
      else if (t.status === 'claimed') setActiveTab('claimed');
      else setActiveTab('closed');
    }
  }, [ticketIdFromUrl, tickets, selectedTicketId]);

  // Reset selected when leaving the list (mobile) or tab changes
  useEffect(() => {
    if (isMobile) setSelectedTicketId(null);
  }, [isMobile]);

  const tabCounts = useMemo(() => {
    const c: Record<Tab, number> = { open: 0, claimed: 0, closed: 0, all: 0 };
    tickets.forEach((t) => {
      c.all++;
      if (t.status === 'open') c.open++;
      else if (t.status === 'claimed') c.claimed++;
      else if (t.status === 'closed') c.closed++;
    });
    return c;
  }, [tickets]);

  const filtered = useMemo(() => {
    let list =
      activeTab === 'all'
        ? tickets
        : tickets.filter((t) => t.status === activeTab);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.requester.displayName.toLowerCase().includes(q) ||
          t.requester.email.toLowerCase().includes(q) ||
          (t.subject ?? '').toLowerCase().includes(q) ||
          (t.lastMessagePreview ?? '').toLowerCase().includes(q)
      );
    }

    // Sort: open before claimed before closed, then by recency
    const order = { open: 0, claimed: 1, closed: 2 } as const;
    return [...list].sort((a, b) => {
      const ra = order[a.status] - order[b.status];
      if (ra !== 0) return ra;
      return (
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime()
      );
    });
  }, [activeTab, tickets, searchQuery]);

  const selectedTicket =
    tickets.find((t) => t.id === selectedTicketId) ?? null;

  const showPanelOnMobile = isMobile && selectedTicket !== null;

  const handleSelect = (id: string) => setSelectedTicketId(id);
  const handleBack = () => setSelectedTicketId(null);

  return (
    <div className={styles.view}>
      {/* List pane */}
      <aside
        className={`${styles.listPane} ${showPanelOnMobile ? styles.listHidden : ''}`}
      >
        <div className={styles.listHeader}>
          <div>
            <h2 className={styles.title}>Support Tickets</h2>
            <p className={styles.subtitle}>
              {viewerRole === 'ADMIN' ? 'Admin view' : 'Employee view'}
            </p>
          </div>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search tickets…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.tabs}>
          {(['open', 'claimed', 'closed', 'all'] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === key ? styles.tabActive : ''
              }`}
              onClick={() => setActiveTab(key)}
            >
              {key === 'open'
                ? 'Open'
                : key === 'claimed'
                ? 'Claimed'
                : key === 'closed'
                ? 'Closed'
                : 'All'}
              <span className={styles.tabCount}>{tabCounts[key]}</span>
            </button>
          ))}
        </div>

        <div className={styles.listScroll}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>
                <FontAwesomeIcon icon={faHeadset} />
              </span>
              <h3>{searchQuery ? 'No matches' : 'No tickets here'}</h3>
              <p>
                {searchQuery
                  ? `No tickets match "${searchQuery}".`
                  : activeTab === 'open'
                  ? 'No unclaimed tickets right now.'
                  : activeTab === 'claimed'
                  ? 'No claimed tickets yet.'
                  : activeTab === 'closed'
                  ? 'No closed tickets yet.'
                  : 'Support tickets will appear here.'}
              </p>
            </div>
          ) : (
            filtered.map((t) => (
              <TicketRow
                key={t.id}
                ticket={t}
                isActive={t.id === selectedTicketId}
                onClick={() => handleSelect(t.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Panel pane */}
      <div
        className={`${styles.panelPane} ${
          showPanelOnMobile ? styles.panelPaneVisible : ''
        }`}
      >
        <StaffSupportPanel
          ticket={selectedTicket}
          viewerId={viewerId}
          onBack={isMobile ? handleBack : undefined}
          onChanged={reload}
        />
      </div>
    </div>
  );
};

interface TicketRowProps {
  ticket: StaffSupportTicket;
  isActive: boolean;
  onClick: () => void;
}

const TicketRow: React.FC<TicketRowProps> = ({ ticket, isActive, onClick }) => {
  const hasUnread = ticket.unreadCount > 0;
  const isMine = ticket.isMine;

  return (
    <button
      type="button"
      className={`${styles.row} ${isActive ? styles.rowActive : ''} ${
        hasUnread ? styles.rowUnread : ''
      }`}
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
    >
      <div
        className={styles.avatar}
        style={{ background: ticket.requester.avatarGradient }}
        aria-hidden="true"
      >
        {getInitials(ticket.requester.displayName)}
      </div>

      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>
            {ticket.requester.displayName}
          </span>
          <span className={styles.rowTime}>
            {formatRelative(ticket.lastActivityAt)}
          </span>
        </div>

        <div className={styles.rowSubject}>
          {ticket.subject?.trim() || 'Support ticket'}
        </div>

        <div className={styles.rowPreview}>
          {truncate(ticket.lastMessagePreview || 'No messages yet', 60)}
        </div>

        <div className={styles.rowMeta}>
          <span
            className={`${styles.statusBadge} ${
              styles[`status_${ticket.status}`]
            }`}
          >
            {statusLabel(ticket.status)}
          </span>
          {isMine && ticket.status !== 'closed' && (
            <span className={styles.mineTag}>
              <FontAwesomeIcon icon={faCheckCircle} /> Yours
            </span>
          )}
          {!ticket.assignedStaffId && ticket.status === 'open' && (
            <span className={styles.unclaimedTag}>
              <FontAwesomeIcon icon={faHourglassHalf} /> Unclaimed
            </span>
          )}
          {ticket.assignedStaffDisplayName && !isMine && ticket.status !== 'closed' && (
            <span className={styles.assignedTag}>
              {ticket.assignedStaffDisplayName}
            </span>
          )}
          {hasUnread && (
            <span className={styles.unreadDot} aria-label="Unread" />
          )}
        </div>
      </div>

      <FontAwesomeIcon icon={faChevronRight} className={styles.chevron} />
    </button>
  );
};

export default StaffSupportView;