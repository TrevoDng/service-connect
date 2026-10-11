// src/components/Notifications/NotificationsDropdown.tsx

import React, { useState } from 'react';
import { useNotifications } from '../../account/context/NotificationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
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
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  } = useNotifications();

  // Which item (if any) is currently showing its delete affordance.
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const visible = notifications.slice(0, maxItems);

  const handleClearAll = () => {
    if (
      window.confirm(
        'Clear all notifications? This cannot be undone.'
      )
    ) {
      clearAll();
    }
  };

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

        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button
              type="button"
              className={styles.markAllBtn}
              onClick={markAllAsRead}
              title="Mark all as read"
            >
              <FontAwesomeIcon icon={faCheck} />
              Mark all
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              className={styles.clearAllBtn}
              onClick={handleClearAll}
              title="Clear all notifications"
              aria-label="Clear all notifications"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
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
                  revealed={revealedId === n.id}
                  onReveal={() => setRevealedId(n.id)}
                  onHide={() =>
                    setRevealedId((cur) => (cur === n.id ? null : cur))
                  }
                  onDelete={() => {
                    remove(n.id);
                    setRevealedId((cur) => (cur === n.id ? null : cur));
                  }}
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
