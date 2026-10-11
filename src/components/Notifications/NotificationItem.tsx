// src/components/Notifications/NotificationItem.tsx

import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification, NotificationType } from '../../types';
import { formatRelative } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBell,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faCommentDots,
  faCamera,
  faKey,
  faDollarSign,
  faTruckFast,
  faCircleExclamation,
  faUserShield,
  faPaperPlane,
  faGavel,
  faStar,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import styles from './NotificationItem.module.scss';

// How long the user must hold before the delete affordance appears (ms)
const LONG_PRESS_MS = 500;

export interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  /** Optional click override — default is to navigate to linkTo */
  onNavigate?: (notification: Notification) => void;
  /** Close the dropdown after selecting */
  onSelect?: () => void;

  /** Whether the delete affordance is visible on this row */
  revealed?: boolean;
  /** Called when a long-press reveals the affordance */
  onReveal?: () => void;
  /** Called when the reveal should be hidden */
  onHide?: () => void;
  /** Called when the delete button is pressed */
  onDelete?: () => void;
}

// ============================================
// ICON + COLOR MAP
// ============================================

interface IconSpec {
  icon: IconDefinition;
  tone: 'info' | 'success' | 'warning' | 'danger' | 'chat';
}

const getIconSpec = (type: NotificationType): IconSpec => {
  switch (type) {
    case 'booking_submitted':
      return { icon: faPaperPlane, tone: 'info' };
    case 'booking_requested':
      return { icon: faBell, tone: 'info' };
    case 'booking_accepted':
    case 'price_agreed':
    case 'account_approved':
      return { icon: faCheckCircle, tone: 'success' };
    case 'booking_declined':
    case 'account_rejected':
      return { icon: faTimesCircle, tone: 'danger' };
    case 'consultation_paid':
    case 'consultation_completed':
    case 'price_proposed':
      return { icon: faDollarSign, tone: 'info' };
    case 'price_disputed':
      return { icon: faCircleExclamation, tone: 'danger' };
    case 'dispute_raised':
      return { icon: faGavel, tone: 'danger' };
    case 'dispute_message':
      return { icon: faCommentDots, tone: 'chat' };
    case 'review_submitted':
      return { icon: faStar, tone: 'warning' };
    case 'review_replied':
      return { icon: faCommentDots, tone: 'chat' };
    case 'clock_in':
      return { icon: faKey, tone: 'warning' };
    case 'clock_confirmed':
      return { icon: faUserShield, tone: 'success' };
    case 'clock_out':
      return { icon: faTruckFast, tone: 'info' };
    case 'photos_uploaded':
      return { icon: faCamera, tone: 'info' };
    case 'job_completed':
      return { icon: faCheckCircle, tone: 'success' };
    case 'chat_message':
      return { icon: faCommentDots, tone: 'chat' };
    case 'account_pending':
      return { icon: faClock, tone: 'warning' };
    default:
      return { icon: faBell, tone: 'info' };
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onNavigate,
  onSelect,
  revealed = false,
  onReveal,
  onHide,
  onDelete,
}) => {
  const navigate = useNavigate();
  const spec = getIconSpec(notification.type);
  const isUnread = !notification.readAt;

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const startLongPress = () => {
    longPressTriggered.current = false;
    if (!onReveal) return;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      onReveal();
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    // Long-press was the intent — don't navigate.
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    // If the delete affordance is visible, a plain click dismisses it.
    if (revealed && onHide) {
      onHide();
      return;
    }

    if (isUnread) onRead(notification.id);

    if (onNavigate) {
      onNavigate(notification);
    } else if (notification.linkTo) {
      navigate(notification.linkTo);
    }

    if (onSelect) onSelect();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) onDelete();
  };

  return (
    <div
      className={`${styles.item} ${isUnread ? styles.unread : ''} ${
        revealed ? styles.revealed : ''
      }`}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
    >
      <div className={`${styles.icon} ${styles[spec.tone]}`}>
        <FontAwesomeIcon icon={spec.icon} />
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{notification.title}</span>
          <span className={styles.time}>
            {formatRelative(notification.createdAt)}
          </span>
        </div>

        <p className={styles.message}>{notification.message}</p>

        {notification.actorDisplayName && (
          <span className={styles.actor}>
            from {notification.actorDisplayName}
          </span>
        )}
      </div>

      {isUnread && !revealed && (
        <span className={styles.dot} aria-label="Unread" />
      )}

      {onDelete && (
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={handleDelete}
          aria-label="Delete notification"
          title="Delete"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
