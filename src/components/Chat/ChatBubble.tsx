// src/components/Chat/ChatBubble.tsx

import React from 'react';
import type { ChatMessage } from '../../types';
import { formatRelative } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import styles from './ChatBubble.module.scss';

export interface ChatBubbleProps {
  message: ChatMessage;
  /** Display name of the sender (already resolved by the parent) */
  senderName: string;
  /** Whether this bubble belongs to the currently logged-in user */
  isOwn: boolean;
  /** Optional gradient for the sender's avatar (used when not `isOwn`) */
  senderAvatarGradient?: string;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase() || 'U';
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  senderName,
  isOwn,
  senderAvatarGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}) => {
  const renderStatusIcon = () => {
    if (!isOwn) return null;
    if (message.status === 'read') {
      return (
        <FontAwesomeIcon
          icon={faCheckDouble}
          className={`${styles.statusIcon} ${styles.statusRead}`}
          title="Read"
        />
      );
    }
    if (message.status === 'delivered') {
      return (
        <FontAwesomeIcon
          icon={faCheckDouble}
          className={styles.statusIcon}
          title="Delivered"
        />
      );
    }
    if (message.status === 'sent') {
      return (
        <FontAwesomeIcon
          icon={faCheck}
          className={styles.statusIcon}
          title="Sent"
        />
      );
    }
    return null; // 'sending' — nothing yet
  };

  return (
    <div className={`${styles.row} ${isOwn ? styles.rowOwn : styles.rowOther}`}>
      {!isOwn && (
        <div
          className={styles.avatar}
          style={{ background: senderAvatarGradient }}
          aria-hidden="true"
        >
          {getInitials(senderName)}
        </div>
      )}

      <div className={styles.bubbleColumn}>
        {!isOwn && <span className={styles.senderName}>{senderName}</span>}

        <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
          <p className={styles.text}>{message.text}</p>
        </div>

        <div className={`${styles.meta} ${isOwn ? styles.metaOwn : styles.metaOther}`}>
          <span className={styles.timestamp}>{formatRelative(message.sentAt)}</span>
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
