// src/components/WorkSession/ClockInCard.tsx

import React from 'react';
import type { WorkSession } from '../../types';
import { formatDateTime, formatTime, formatDuration } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faPlay,
  faStop,
  faCheckCircle,
  faKey,
} from '@fortawesome/free-solid-svg-icons';
import { CountdownTimer } from './CountdownTimer';
import styles from './ClockInCard.module.scss';

export interface ClockInCardProps {
  session: WorkSession;
  /** Fired when the provider clicks "Clock In" */
  onClockIn: (sessionId: string) => void;
  /** Fired when the provider clicks "Clock Out" */
  onClockOut: (sessionId: string) => void;
  /** Optional: fired when the provider clicks "Mark Complete" (Step 5 will gate this) */
  onMarkComplete?: (sessionId: string) => void;
  /** Set true when the site evaluation is done and work is allowed to begin */
  workReady?: boolean;
}

const getStatusLabel = (status: WorkSession['status']): string => {
  switch (status) {
    case 'arrived':
      return 'Arrived — awaiting client confirmation';
    case 'confirmed':
      return 'Confirmed at the gate';
    case 'in_progress':
      return 'Work in progress';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

const getStatusClass = (status: WorkSession['status']): string => {
  switch (status) {
    case 'arrived':
      return styles.statusArrived;
    case 'confirmed':
      return styles.statusConfirmed;
    case 'in_progress':
      return styles.statusInProgress;
    case 'completed':
      return styles.statusCompleted;
    default:
      return '';
  }
};

export const ClockInCard: React.FC<ClockInCardProps> = ({
  session,
  onClockIn,
  onClockOut,
  onMarkComplete,
  workReady = true,
}) => {
  const lastClockEvent = session.clockEvents[session.clockEvents.length - 1];
  const hasActiveCode =
    !!session.currentReferenceCode && session.status !== 'completed';
  const isClockedIn = hasActiveCode && lastClockEvent?.type === 'in';
  const isCompleted = session.status === 'completed';

  // Only show the last 5 clock events in the timeline (compact)
  const recentEvents = session.clockEvents.slice(-5).reverse();

  return (
    <div className={styles.card}>
      {/* Header: status + days + hours */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={`${styles.statusBadge} ${getStatusClass(session.status)}`}>
            {getStatusLabel(session.status)}
          </span>
        </div>
        <div className={styles.headerStats}>
          <span className={styles.stat}>
            <strong>{session.daysWorked}</strong> {session.daysWorked === 1 ? 'day' : 'days'}
          </span>
          <span className={styles.statDivider}>·</span>
          <span className={styles.stat}>
            <strong>{formatDuration(Math.round(session.totalHours * 60))}</strong>
          </span>
        </div>
      </div>

      {/* Reference code block */}
      {hasActiveCode && (
        <div className={styles.codeBlock}>
          <div className={styles.codeLeft}>
            <FontAwesomeIcon icon={faKey} className={styles.codeIcon} />
            <div className={styles.codeInfo}>
              <span className={styles.codeLabel}>Reference code</span>
              <span className={styles.codeValue}>{session.currentReferenceCode}</span>
            </div>
          </div>
          <div className={styles.codeRight}>
            <span className={styles.codeExpiryLabel}>Expires in</span>
            <CountdownTimer expiresAt={session.referenceCodeExpiresAt} />
          </div>
        </div>
      )}

      {/* Hint when no active code but work not complete */}
      {!hasActiveCode && !isCompleted && (
        <div className={styles.hint}>
          <FontAwesomeIcon icon={faClock} />
          <span>Ready to clock in when you arrive at the site.</span>
        </div>
      )}

      {/* Clock events timeline */}
      {session.clockEvents.length > 0 && (
        <div className={styles.timeline}>
          <span className={styles.timelineLabel}>Recent activity</span>
          <ul className={styles.timelineList}>
            {recentEvents.map((event) => (
              <li key={event.id} className={styles.timelineItem}>
                <FontAwesomeIcon
                  icon={event.type === 'in' ? faPlay : faStop}
                  className={`${styles.timelineIcon} ${
                    event.type === 'in' ? styles.iconIn : styles.iconOut
                  }`}
                />
                <span className={styles.timelineType}>
                  {event.type === 'in' ? 'Clock in' : 'Clock out'}
                </span>
                <span className={styles.timelineTime}>{formatTime(event.at)}</span>
                {event.referenceCode && (
                  <span className={styles.timelineCode}>{event.referenceCode}</span>
                )}
                {event.confirmedByClient && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className={styles.timelineConfirmed}
                    title="Client confirmed"
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        {!hasActiveCode && !isCompleted && (
          <button
            type="button"
            className={styles.clockInBtn}
            onClick={() => onClockIn(session.id)}
            disabled={!workReady}
            title={!workReady ? 'Waiting for site evaluation to complete' : undefined}
          >
            <FontAwesomeIcon icon={faPlay} />
            Clock In
          </button>
        )}

        {isClockedIn && !isCompleted && (
          <button
            type="button"
            className={styles.clockOutBtn}
            onClick={() => onClockOut(session.id)}
          >
            <FontAwesomeIcon icon={faStop} />
            Clock Out
          </button>
        )}

        {!isCompleted && onMarkComplete && (
          <button
            type="button"
            className={styles.completeBtn}
            onClick={() => onMarkComplete(session.id)}
            disabled={isClockedIn}
            title={
              isClockedIn
                ? 'Clock out first before marking the session complete'
                : 'Mark the session as finished'
            }
          >
            <FontAwesomeIcon icon={faCheckCircle} />
            Mark Complete
          </button>
        )}

        {isCompleted && session.completedAt && (
          <div className={styles.completedNote}>
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Completed on {formatDateTime(session.completedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockInCard;
