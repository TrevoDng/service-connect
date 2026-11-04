// src/components/Chat/ChatThreadListItem.tsx

import React from 'react';
import type { ChatThread } from '../../types';
import { formatRelative, truncate } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import type { ViewerRole } from '../../types';
import styles from './ChatThreadListItem.module.scss';

export interface ChatThreadListItemProps {
  thread: ChatThread;
  /**
   * Which side of the thread the current user is on. Determines whose
   * display name and gradient get shown in the list.
   */
  viewerRole: ViewerRole;
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
    // Non-staff: show the "other party" (what the viewer is chatting with).
    // Staff (ADMIN/EMPLOYEE): show both names, provider avatar for context.
    const isStaff = viewerRole === 'ADMIN' || viewerRole === 'EMPLOYEE';
    const other = viewerRole === 'CLIENT' ? thread.provider : thread.client;

    const avatarGradient =
      viewerRole === 'PROVIDER'
        ? thread.client.avatarGradient
        : thread.provider.avatarGradient;
    const avatarName =
      viewerRole === 'PROVIDER'
        ? thread.client.displayName
        : thread.provider.displayName;

    const displayName = isStaff
      ? `${thread.client.displayName} ↔ ${thread.provider.displayName}`
      : viewerRole === 'CLIENT'
      ? thread.provider.displayName
      : thread.client.displayName;

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
                avatarGradient ||
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
            aria-hidden="true"
          >
            {getInitials(avatarName)}
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
            <span className={styles.name}>{displayName}</span>
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
