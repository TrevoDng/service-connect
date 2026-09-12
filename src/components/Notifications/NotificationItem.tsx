// src/components/Notifications/NotificationItem.tsx

import React from 'react';
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
} from '@fortawesome/free-solid-svg-icons';
import styles from './NotificationItem.module.scss';

export interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  /** Optional click override — default is to navigate to linkTo */
  onNavigate?: (notification: Notification) => void;
  /** Close the dropdown after selecting */
  onSelect?: () => void;
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
}) => {
  const navigate = useNavigate();
  const spec = getIconSpec(notification.type);
  const isUnread = !notification.readAt;

  const handleClick = () => {
    // Mark as read first
    if (isUnread) onRead(notification.id);

    // Custom handler takes priority
    if (onNavigate) {
      onNavigate(notification);
    } else if (notification.linkTo) {
      navigate(notification.linkTo);
    }

    // Close dropdown
    if (onSelect) onSelect();
  };

  return (
    <button
      type="button"
      className={`${styles.item} ${isUnread ? styles.unread : ''}`}
      onClick={handleClick}
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

      {isUnread && <span className={styles.dot} aria-label="Unread" />}
    </button>
  );
};

export default NotificationItem;
