// src/components/WorkSession/CountdownTimer.tsx

import React, { useEffect, useState } from 'react';
import { msRemaining, formatCountdown, isExpiringSoon } from '../../utils/countdown';
import styles from './CountdownTimer.module.scss';

export interface CountdownTimerProps {
  /** ISO timestamp of when the code expires */
  expiresAt?: string;
  /** Optional: fired once when the countdown reaches zero */
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  onExpire,
}) => {
  const [remaining, setRemaining] = useState<number>(() => msRemaining(expiresAt));
  const [hasFiredExpire, setHasFiredExpire] = useState(false);

  // Reset when expiresAt changes (new code)
  useEffect(() => {
    setRemaining(msRemaining(expiresAt));
    setHasFiredExpire(false);
  }, [expiresAt]);

  // Tick every second
  useEffect(() => {
    if (!expiresAt) return;
    const id = window.setInterval(() => {
      const next = msRemaining(expiresAt);
      setRemaining(next);

      if (next === 0 && !hasFiredExpire) {
        setHasFiredExpire(true);
        if (onExpire) onExpire();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, hasFiredExpire, onExpire]);

  if (!expiresAt) return null;

  const expired = remaining === 0;
  const warning = isExpiringSoon(expiresAt);

  return (
    <span
      className={`${styles.countdown} ${expired ? styles.expired : ''} ${
        warning && !expired ? styles.warning : ''
      }`}
      title={new Date(expiresAt).toLocaleString('en-ZA')}
    >
      {expired ? 'Expired' : formatCountdown(remaining)}
    </span>
  );
};

export default CountdownTimer;
