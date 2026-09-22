// src/components/Requests/SubstepTimeline.tsx

import React, { useEffect, useState } from 'react';
import type { WorkSession, ViewerRole } from '../../types';
import { groupSessionIntoDays, formatDayLabel } from '../../utils/workSessionDays';
import { formatTime } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faCircle,
  faPlus,
  faCamera,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import styles from './SubstepTimeline.module.scss';

// ============================================
// PROPS
// ============================================

export interface SubstepTimelineProps {
  session: WorkSession;
  viewerRole: ViewerRole;
  /** Called when provider clicks "+ Add today's progress" */
  onAddDay?: (session: WorkSession) => void;
  /** Called when provider clicks a specific day */
  onOpenDay?: (session: WorkSession, dayIndex: number) => void;
}

// ============================================
// COMPONENT
// ============================================

export const SubstepTimeline: React.FC<SubstepTimelineProps> = ({
  session,
  viewerRole,
  onAddDay,
  onOpenDay,
}) => {
  const days = groupSessionIntoDays(session);
  const [activeIndex, setActiveIndex] = useState(days.length - 1);

  // Keep the active index pinned to the newest day when the session grows
  useEffect(() => {
    setActiveIndex(days.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days.length]);

  if (days.length === 0) return null;

  const active = days[activeIndex];
  const isProvider = viewerRole === 'PROVIDER';
  const canAddDay = isProvider && !!onAddDay;

  // Count photos for this day
  const photoCount =
    active.beforePhotos.length +
    active.progressStages.reduce((sum, st) => sum + st.photos.length, 0) +
    active.finalPhotos.length;

  // Duration for a closed day
  const dayDuration =
    active.endAt && active.startAt
      ? (new Date(active.endAt).getTime() - new Date(active.startAt).getTime()) /
        3_600_000
      : null;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={styles.wrapper}>
      {/* Header row: title + navigation */}
      <div className={styles.header}>
        <h5 className={styles.title}>
          Work days <span className={styles.count}>{days.length}</span>
        </h5>

        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navBtn}
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            aria-label="Previous day"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className={styles.navLabel}>
            Day {activeIndex + 1} of {days.length}
          </span>
          <button
            type="button"
            className={styles.navBtn}
            disabled={activeIndex >= days.length - 1}
            onClick={() =>
              setActiveIndex((i) => Math.min(days.length - 1, i + 1))
            }
            aria-label="Next day"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      {/* Day strip */}
      <div className={styles.strip}>
        {days.map((day, i) => (
          <button
            key={day.startAt}
            type="button"
            className={`${styles.stripDot} ${
              i === activeIndex ? styles.stripDotActive : ''
            } ${day.isOpen ? styles.stripDotOpen : ''}`}
            onClick={() => setActiveIndex(i)}
            title={formatDayLabel(day.startAt)}
            aria-label={`Day ${i + 1}`}
          >
            <FontAwesomeIcon icon={day.isOpen ? faCircle : faCheckCircle} />
          </button>
        ))}
      </div>

      {/* Active day card */}
      <div className={styles.dayCard}>
        <div className={styles.dayTop}>
          <div>
            <span className={styles.dayLabel}>
              {formatDayLabel(active.startAt)}
            </span>
            <span className={styles.dayTimeRange}>
              <FontAwesomeIcon icon={faClock} />
              {formatTime(active.startAt)}
              {active.endAt ? ` — ${formatTime(active.endAt)}` : ' — in progress'}
            </span>
          </div>

          <div className={styles.dayMeta}>
            {dayDuration !== null && (
              <span className={styles.dayDuration}>
                {dayDuration.toFixed(1)}h
              </span>
            )}
            {photoCount > 0 && (
              <span className={styles.dayPhotos}>
                <FontAwesomeIcon icon={faCamera} />
                {photoCount}
              </span>
            )}
          </div>
        </div>

        {/* Gate status */}
        <div className={styles.gateRow}>
          <span
            className={`${styles.gateBadge} ${
              active.gateConfirmed ? styles.gateConfirmed : styles.gateSkipped
            }`}
          >
            {active.gateConfirmed
              ? 'Gate confirmed'
              : 'Gate not confirmed — recorded'}
          </span>
          {active.referenceCode && (
            <span className={styles.gateRef}>
              Ref: {active.referenceCode}
            </span>
          )}
        </div>

        {/* Stages preview (compact) */}
        {active.progressStages.length > 0 && (
          <div className={styles.stages}>
            {active.progressStages.map((st) => (
              <div key={st.id} className={styles.stageRow}>
                <span className={styles.stageLabel}>{st.label}</span>
                <span className={styles.stagePhotos}>
                  {st.photos.length} photo{st.photos.length === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Open day / add-day CTAs */}
        {isProvider && onOpenDay && (
          <button
            type="button"
            className={styles.openDayBtn}
            onClick={() => onOpenDay(session, activeIndex)}
          >
            Open this day's details
          </button>
        )}
      </div>

      {/* Provider can add a new day */}
      {canAddDay && (
        <button
          type="button"
          className={styles.addDayBtn}
          onClick={() => onAddDay!(session)}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add today's progress
        </button>
      )}
    </div>
  );
};

export default SubstepTimeline;
