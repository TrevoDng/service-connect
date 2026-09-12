// src/components/WorkSession/ClientWorkSessionCard.tsx

import React, { useState } from 'react';
import type { WorkSession, Booking } from '../../types';
import { formatRelative, formatDuration, formatDate } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCamera,
  faImages,
  faFlagCheckered,
  faChevronDown,
  faChevronUp,
  faHardHat,
} from '@fortawesome/free-solid-svg-icons';
import { PhotoSection } from './PhotoSection';
import styles from './ClientWorkSessionCard.module.scss';

export interface ClientWorkSessionCardProps {
  session: WorkSession;
  booking: Booking;
}

const statusLabel = (status: WorkSession['status']): string => {
  switch (status) {
    case 'arrived':
      return 'Provider at your gate';
    case 'confirmed':
      return 'Confirmed — work starting';
    case 'in_progress':
      return 'Work in progress';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

const statusClass = (status: WorkSession['status']): string => {
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

export const ClientWorkSessionCard: React.FC<ClientWorkSessionCardProps> = ({
  session,
  booking,
}) => {
  // Collapsed by default only on mobile; on desktop always expanded.
  // We use CSS to control the actual visibility — this state is the
  // user's mobile toggle.
  const [isExpanded, setIsExpanded] = useState(false);

  const beforeLabel =
    session.beforePhotos.length > 0
      ? `${session.beforePhotos.length} / 5`
      : 'Not yet uploaded';
  const progressLabel =
    session.progressStages.length > 0
      ? `${session.progressStages.length} stage${session.progressStages.length === 1 ? '' : 's'}`
      : 'No stages yet';
  const finalLabel =
    session.finalPhotos.length > 0
      ? `${session.finalPhotos.length} / 5`
      : 'Not yet uploaded';

  return (
    <div className={styles.card}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <FontAwesomeIcon icon={faHardHat} />
        </div>

        <div className={styles.headerInfo}>
          <span className={`${styles.statusBadge} ${statusClass(session.status)}`}>
            {statusLabel(session.status)}
          </span>
          <h4 className={styles.title}>{booking.serviceTitle}</h4>
          <p className={styles.provider}>
            Provider: <strong>{booking.providerDisplayName}</strong>
          </p>
        </div>

        <div className={styles.headerStats}>
          <span className={styles.stat}>
            <strong>{session.daysWorked}</strong>{' '}
            {session.daysWorked === 1 ? 'day' : 'days'}
          </span>
          <span className={styles.statDivider}>·</span>
          <span className={styles.stat}>
            {formatDuration(Math.round(session.totalHours * 60))}
          </span>
          <span className={styles.statDivider}>·</span>
          <span className={styles.stat}>
            Updated {formatRelative(session.updatedAt)}
          </span>
        </div>

        {/* Mobile-only expand toggle */}
        <button
          type="button"
          className={styles.expandToggle}
          onClick={() => setIsExpanded((v) => !v)}
          aria-label={isExpanded ? 'Collapse photos' : 'Expand photos'}
          aria-expanded={isExpanded}
        >
          <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
        </button>
      </header>

      {/* Photo sections */}
      <div
        className={`${styles.sections} ${
          isExpanded ? styles.sectionsExpanded : ''
        }`}
      >
        {/* Before */}
        <PhotoSection
          icon={faCamera}
          title="Before work"
          countLabel={beforeLabel}
          photos={session.beforePhotos}
          currentCount={session.beforePhotos.length}
          maxPhotos={5}
          emptyMessage="The provider hasn't uploaded before photos yet."
        />

        {/* Progress */}
        <PhotoSection
          icon={faImages}
          title="Progress"
          countLabel={progressLabel}
          currentCount={session.progressStages.length}
          maxPhotos={Infinity}
        >
          {session.progressStages.length === 0 ? (
            <div className={styles.emptyInline}>
              No progress stages uploaded yet.
            </div>
          ) : (
            <div className={styles.progressList}>
              {session.progressStages.map((stage) => (
                <article key={stage.id} className={styles.progressStage}>
                  <header className={styles.stageHeader}>
                    <h5 className={styles.stageLabel}>{stage.label}</h5>
                    <span className={styles.stageDate}>
                      {formatDate(stage.date)}
                    </span>
                  </header>
                  <div className={styles.stagePhotoGrid}>
                    {stage.photos.map((photo) => (
                      <figure key={photo.id} className={styles.stagePhotoTile}>
                        <img
                          src={photo.url}
                          alt={photo.caption || stage.label}
                          loading="lazy"
                        />
                        {photo.caption && (
                          <figcaption>{photo.caption}</figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </PhotoSection>

        {/* Final */}
        <PhotoSection
          icon={faFlagCheckered}
          title="Final completion"
          countLabel={finalLabel}
          photos={session.finalPhotos}
          currentCount={session.finalPhotos.length}
          maxPhotos={5}
          emptyMessage="Final photos will appear here when the job is done."
        />
      </div>
    </div>
  );
};

export default ClientWorkSessionCard;
