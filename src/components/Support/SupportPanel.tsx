// src/components/Support/SupportPanel.tsx
//
// The thread view. Header always says "ServiceConnect Support" — never
// the individual staff member's name. Shows ticket status + a closed
// hint. Reuses ChatComposer with uploadEntityType="support".

import React, { useEffect, useRef } from 'react';
import type { SupportTicket } from '../../types';
import { useSupportTicketMessages } from '../../hooks/useSupportTicketMessages';
import { SUPPORT_DISPLAY_NAME, SUPPORT_AVATAR_GRADIENT } from '../../types/support.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeadset,
  faArrowLeft,
  faLock,
  faUnlock,
} from '@fortawesome/free-solid-svg-icons';
import { ChatComposer } from '../Chat';
import { SupportBubble } from './SupportBubble';
import styles from './SupportPanel.module.scss';

export interface SupportPanelProps {
  ticket: SupportTicket | null;
  viewerId: string;
  onBack?: () => void;
}

const statusLabel = (s: SupportTicket['status']): string => {
  if (s === 'open') return 'Open';
  if (s === 'claimed') return 'Being handled';
  return 'Closed';
};

export const SupportPanel: React.FC<SupportPanelProps> = ({
  ticket,
  viewerId,
  onBack,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { messages, send } = useSupportTicketMessages(
    ticket?.id ?? null,
    viewerId
  );

  // Auto-scroll on new messages / ticket change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, ticket?.id]);

  if (!ticket) {
    return (
      <div className={styles.emptyPanel}>
        <FontAwesomeIcon icon={faHeadset} className={styles.emptyIcon} />
        <h3>Select a support ticket</h3>
        <p>Choose a ticket from the list, or open a new one to get help.</p>
      </div>
    );
  }

  const isClosed = ticket.status === 'closed';

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        {onBack && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            aria-label="Back to tickets"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        )}

        <div
          className={styles.headerAvatar}
          style={{ background: SUPPORT_AVATAR_GRADIENT }}
          aria-hidden="true"
        >
          <FontAwesomeIcon icon={faHeadset} />
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.headerName}>
            <span>{SUPPORT_DISPLAY_NAME}</span>
            <span
              className={`${styles.statusBadge} ${styles[`status_${ticket.status}`]}`}
            >
              {statusLabel(ticket.status)}
            </span>
          </div>
          <div className={styles.headerMeta}>
            {ticket.subject?.trim() || 'Support ticket'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages} ref={scrollRef}>
        {messages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>No messages yet. Send the first message below.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <SupportBubble key={msg.id} message={msg} viewerId={viewerId} />
          ))
        )}
      </div>

      {/* Closed hint + composer */}
      {isClosed && (
        <div className={styles.closedHint}>
          <FontAwesomeIcon icon={faLock} />
          <span>
            This ticket is closed. Sending a new message will reopen it.
          </span>
          <FontAwesomeIcon icon={faUnlock} style={{ marginLeft: 4, opacity: 0.7 }} />
        </div>
      )}

      <ChatComposer
        onSend={(text, attachments) => {
          // Swallow errors — ChatComposer already cleared its internal state.
          // A poll on the next tick will surface any server-side message.
          send(text, attachments).catch(() => {
            /* handled by hook */
          });
        }}
        threadId={ticket.id}
        uploadEntityType="support"
        placeholder="Type your message to support…"
      />
    </div>
  );
};

export default SupportPanel;