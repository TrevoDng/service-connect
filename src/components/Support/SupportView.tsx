// src/components/Support/SupportView.tsx
//
// List + panel, mirroring MessagesView. Reads ?ticket= as a hint (from
// notification deep-links) but otherwise drives selection via local
// state so the "New Ticket" form doesn't require URL changes.

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../account/context/AuthContext';
import { useMySupportTickets } from '../../hooks/useMySupportTickets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadset, faPlus } from '@fortawesome/free-solid-svg-icons';
import { SupportTicketListItem } from './SupportTicketListItem';
import { SupportPanel } from './SupportPanel';
import { NewSupportTicketForm } from './NewSupportTicketForm';
import type { SupportTicket } from '../../types';
import styles from './SupportView.module.scss';

export interface SupportViewProps {
  viewerRole: 'CLIENT' | 'PROVIDER';
  /** Override for embedded/testing contexts. Defaults to current auth user. */
  viewerIdOverride?: string;
}

export const SupportView: React.FC<SupportViewProps> = ({
  viewerRole,
  viewerIdOverride,
}) => {
  const { user } = useAuth();
  const viewerId = viewerIdOverride ?? user?.id ?? null;

  const [searchParams] = useSearchParams();
  const ticketIdFromUrl = searchParams.get('ticket');

  const { tickets, reload } = useMySupportTickets(viewerId);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Mobile breakpoint
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // URL → selection (priority 1). Only when the ticket is actually in our list.
  useEffect(() => {
    if (
      ticketIdFromUrl &&
      tickets.some((t) => t.id === ticketIdFromUrl) &&
      selectedTicketId !== ticketIdFromUrl
    ) {
      setSelectedTicketId(ticketIdFromUrl);
      setShowNewForm(false);
    }
  }, [tickets, ticketIdFromUrl, selectedTicketId]);

  // Default selection on desktop when nothing else picked a ticket.
  useEffect(() => {
    if (
      !isMobile &&
      !showNewForm &&
      selectedTicketId === null &&
      tickets.length > 0
    ) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [isMobile, showNewForm, selectedTicketId, tickets]);

  // If selected ticket was removed / not in list anymore, reset.
  useEffect(() => {
    if (selectedTicketId && !tickets.some((t) => t.id === selectedTicketId)) {
      setSelectedTicketId(null);
    }
  }, [tickets, selectedTicketId]);

  const selectedTicket: SupportTicket | null =
    tickets.find((t) => t.id === selectedTicketId) ?? null;

  const showPanelOnMobile = isMobile && (selectedTicket !== null || showNewForm);

  const handleSelectTicket = (id: string) => {
    setShowNewForm(false);
    setSelectedTicketId(id);
  };

  const handleNewTicket = () => {
    setSelectedTicketId(null);
    setShowNewForm(true);
  };

  const handleCreated = (ticket: SupportTicket) => {
    setShowNewForm(false);
    setSelectedTicketId(ticket.id);
    reload();
  };

  const handleBackToList = () => {
    setSelectedTicketId(null);
    setShowNewForm(false);
  };

  const emptyHint = useMemo(() => {
    if (!viewerId) return 'Log in to see your support tickets.';
    return viewerRole === 'CLIENT'
      ? 'Reach out if you need help with a booking, payment, or provider.'
      : 'Reach out if you need help with a client, booking, or payment.';
  }, [viewerId, viewerRole]);

  return (
    <div className={styles.view}>
      {/* Ticket list */}
      <aside
        className={`${styles.list} ${showPanelOnMobile ? styles.listHidden : ''}`}
      >
        <div className={styles.listHeader}>
          <h2>Help &amp; Support</h2>
          <button
            type="button"
            className={styles.newBtn}
            onClick={handleNewTicket}
            disabled={!viewerId}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>New ticket</span>
          </button>
        </div>

        <div className={styles.listScroll}>
          {tickets.length === 0 ? (
            <div className={styles.emptyList}>
              <FontAwesomeIcon icon={faHeadset} className={styles.emptyIcon} />
              <p>No support tickets yet.</p>
              <p className={styles.emptyHint}>{emptyHint}</p>
              {viewerId && (
                <button
                  type="button"
                  className={styles.startBtn}
                  onClick={handleNewTicket}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Open a ticket
                </button>
              )}
            </div>
          ) : (
            tickets.map((t) => (
              <SupportTicketListItem
                key={t.id}
                ticket={t}
                isActive={!showNewForm && t.id === selectedTicketId}
                onClick={handleSelectTicket}
              />
            ))
          )}
        </div>
      </aside>

      {/* Panel */}
      <div
        className={`${styles.panelWrapper} ${
          showPanelOnMobile ? styles.panelWrapperVisible : ''
        }`}
      >
        {showNewForm ? (
          <NewSupportTicketForm
            onCancel={() => setShowNewForm(false)}
            onCreated={handleCreated}
          />
        ) : (
          <SupportPanel
            ticket={selectedTicket}
            viewerId={viewerId ?? ''}
            onBack={isMobile ? handleBackToList : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default SupportView;