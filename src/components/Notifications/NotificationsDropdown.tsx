// src/components/Notifications/NotificationsDropdown.tsx

import React from 'react';
import { useNotifications } from '../../account/context/NotificationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck } from '@fortawesome/free-solid-svg-icons';
import { NotificationItem } from './NotificationItem';
import styles from './NotificationsDropdown.module.scss';

export interface NotificationsDropdownProps {
  /** Called after any item is clicked (so the parent can close) */
  onClose: () => void;
  /** Max items to show before cutting off */
  maxItems?: number;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  onClose,
  maxItems = 12,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const visible = notifications.slice(0, maxItems);

  return (
    <div
      className={styles.dropdown}
      role="dialog"
      aria-label="Notifications"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Notifications</h3>
          {unreadCount > 0 && (
            <span className={styles.unreadPill}>{unreadCount} new</span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className={styles.markAllBtn}
            onClick={markAllAsRead}
          >
            <FontAwesomeIcon icon={faCheck} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <FontAwesomeIcon icon={faBell} className={styles.emptyIcon} />
            <p>You're all caught up.</p>
            <p className={styles.emptyHint}>
              New activity will appear here.
            </p>
          </div>
        ) : (
          <ul className={styles.list}>
            {visible.map((n) => (
              <li key={n.id}>
                <NotificationItem
                  notification={n}
                  onRead={markAsRead}
                  onSelect={onClose}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {notifications.length > maxItems && (
        <div className={styles.footer}>
          <span>Showing {maxItems} of {notifications.length}</span>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
