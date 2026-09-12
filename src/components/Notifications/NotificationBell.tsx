// src/components/Notifications/NotificationBell.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../../account/context/NotificationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { NotificationsDropdown } from './NotificationsDropdown';
import styles from './NotificationBell.module.scss';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Outside click + Escape to close
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.bell} ${open ? styles.bellOpen : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
      >
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{badgeLabel}</span>
        )}
      </button>

      {open && <NotificationsDropdown onClose={() => setOpen(false)} />}
    </div>
  );
};

export default NotificationBell;
