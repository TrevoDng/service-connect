// src/components/Chat/ChatThreadListItem.tsx

import React from 'react';
import type { ChatThread } from '../../types';
import { formatRelative, truncate } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './ChatThreadListItem.module.scss';

export interface ChatThreadListItemProps {
  thread: ChatThread;
  /**
   * Which side of the thread the current user is on. Determines whose
   * display name and gradient get shown in the list.
   */
  viewerRole: 'CLIENT' | 'PROVIDER';
  /** Highlight this row (currently open thread) */
  isActive?: boolean;
  /** Fired when the user clicks the row */
  onClick: (threadId: string) => void;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase() || 'U';
};

export const ChatThreadListItem: React.FC<ChatThreadListItemProps> = ({
  thread,
  viewerRole,
  isActive = false,
  onClick,
}) => {
  // If the viewer is a CLIENT, show the provider's info in the list.
  // If the viewer is a PROVIDER, show the client's info.
  const other = viewerRole === 'CLIENT' ? thread.provider : thread.client;

  const hasUnread = thread.unreadCount > 0;

  return (
    <button
      type="button"
      className={`${styles.item} ${isActive ? styles.itemActive : ''} ${
        hasUnread ? styles.itemUnread : ''
      }`}
      onClick={() => onClick(thread.id)}
      aria-current={isActive ? 'true' : undefined}
    >
      {/* Avatar */}
      <div className={styles.avatarWrapper}>
        <div
          className={styles.avatar}
          style={{
            background:
              other.avatarGradient ||
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
          aria-hidden="true"
        >
          {getInitials(other.displayName)}
        </div>
        {hasUnread && (
          <span className={styles.unreadBadge} aria-label={`${thread.unreadCount} unread`}>
            {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.nameWrapper}>
            <span className={styles.name}>{other.displayName}</span>
            {viewerRole === 'CLIENT' && other.providerVerified && (
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles.verifiedIcon}
                title="Verified provider"
              />
            )}
          </div>
          <span className={styles.timestamp}>{formatRelative(thread.lastMessageAt)}</span>
        </div>

        <div className={styles.bottomRow}>
          <span className={styles.preview}>
            {thread.lastMessagePreview
              ? truncate(thread.lastMessagePreview, 60)
              : 'No messages yet'}
          </span>
        </div>

        {/* Optional: provider rating inline (only shown to clients) */}
        {viewerRole === 'CLIENT' && other.providerRating !== undefined && (
          <div className={styles.meta}>
            <span className={styles.rating}>⭐ {other.providerRating.toFixed(1)}</span>
            {other.providerCompletedJobs !== undefined && (
              <span className={styles.jobs}>
                · {other.providerCompletedJobs} jobs
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
};

export default ChatThreadListItem;
