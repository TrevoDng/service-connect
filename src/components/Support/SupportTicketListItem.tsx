// src/components/Support/SupportTicketListItem.tsx
import React from 'react';
import type { SupportTicket } from '../../types';
import { formatRelative, truncate } from '../../utils/formatters';
import { SUPPORT_DISPLAY_NAME } from '../../types/support.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadset } from '@fortawesome/free-solid-svg-icons';
import styles from './SupportTicketListItem.module.scss';

export interface SupportTicketListItemProps {
  ticket: SupportTicket;
  isActive?: boolean;
  onClick: (ticketId: string) => void;
}

const statusLabel = (s: SupportTicket['status']): string => {
  if (s === 'open') return 'Open';
  if (s === 'claimed') return 'Handled';
  return 'Closed';
};

export const SupportTicketListItem: React.FC<SupportTicketListItemProps> = ({
  ticket,
  isActive = false,
  onClick,
}) => {
  const hasUnread = ticket.unreadCount > 0;
  const title = ticket.subject?.trim() || 'Support ticket';

  return (
    <button
      type="button"
      className={`${styles.item} ${isActive ? styles.itemActive : ''} ${
        hasUnread ? styles.itemUnread : ''
      }`}
      onClick={() => onClick(ticket.id)}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className={styles.avatarWrapper}>
        <div className={styles.avatar} aria-hidden="true">
          <FontAwesomeIcon icon={faHeadset} />
        </div>
        {hasUnread && (
          <span
            className={styles.unreadBadge}
            aria-label={`${ticket.unreadCount} unread`}
          >
            {ticket.unreadCount > 99 ? '99+' : ticket.unreadCount}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.nameWrapper}>
            <span className={styles.name}>{title}</span>
            <span
              className={`${styles.statusBadge} ${styles[`status_${ticket.status}`]}`}
            >
              {statusLabel(ticket.status)}
            </span>
          </div>
          <span className={styles.timestamp}>
            {formatRelative(ticket.lastActivityAt)}
          </span>
        </div>

        <div className={styles.bottomRow}>
          <span className={styles.preview}>
            {ticket.lastMessagePreview
              ? truncate(ticket.lastMessagePreview, 60)
              : 'No messages yet'}
          </span>
        </div>

        <div className={styles.meta}>
          <span className={styles.sender}>{SUPPORT_DISPLAY_NAME}</span>
        </div>
      </div>
    </button>
  );
};

export default SupportTicketListItem;