// src/components/WorkSession/ClockConfirmCard.tsx

import React from 'react';
import type { WorkSession } from '../../types';
import { formatTime } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldAlt,
  faCheckCircle,
  faTimesCircle,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import { CountdownTimer } from './CountdownTimer';
import styles from './ClockConfirmCard.module.scss';

export interface ClockConfirmCardProps {
  session: WorkSession;
  /** Name of the provider who is at the gate */
  providerName: string;
  /** Optional provider rating for the trust line */
  providerRating?: number;
  /** Fired when the client confirms the reference code */
  onConfirm: (sessionId: string) => void;
  /** Fired when the client rejects the reference code */
  onDeny: (sessionId: string) => void;
}

export const ClockConfirmCard: React.FC<ClockConfirmCardProps> = ({
  session,
  providerName,
  providerRating,
  onConfirm,
  onDeny,
}) => {
  // Was the arrival already confirmed?
  const confirmEvent = session.clockEvents.find(
    (e) => e.type === 'in' && e.confirmedByClient
  );
  const alreadyConfirmed = !!confirmEvent;

  const hasActiveCode = !!session.currentReferenceCode;

  // If session is completed, no need to confirm anything
  if (session.status === 'completed') return null;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.shieldIcon}>
          <FontAwesomeIcon icon={faShieldAlt} />
        </div>
        <div className={styles.headerText}>
          <h4 className={styles.title}>
            {alreadyConfirmed
              ? 'Confirmed at the gate'
              : 'Provider at your gate'}
          </h4>
          <p className={styles.subtitle}>
            {alreadyConfirmed ? (
              <>
                You confirmed <strong>{providerName}</strong> at{' '}
                {confirmEvent ? formatTime(confirmEvent.at) : '—'}
              </>
            ) : (
              <>
                <strong>{providerName}</strong>
                {providerRating !== undefined && (
                  <span className={styles.rating}> · ⭐ {providerRating.toFixed(1)}</span>
                )}{' '}
                has arrived. Confirm only if the reference code matches.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Reference code (only when NOT yet confirmed) */}
      {!alreadyConfirmed && hasActiveCode && (
        <>
          <div className={styles.codeBox}>
            <span className={styles.codeLabel}>Reference code</span>
            <span className={styles.codeValue}>{session.currentReferenceCode}</span>
            <div className={styles.expiryRow}>
              <span className={styles.expiryLabel}>Expires in</span>
              <CountdownTimer expiresAt={session.referenceCodeExpiresAt} />
            </div>
          </div>

          <div className={styles.warning}>
            <FontAwesomeIcon icon={faUserShield} />
            <span>
              Do not let anyone in unless the code they show you matches exactly.
            </span>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={() => onConfirm(session.id)}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              Confirm &amp; Grant Access
            </button>
            <button
              type="button"
              className={styles.denyBtn}
              onClick={() => onDeny(session.id)}
            >
              <FontAwesomeIcon icon={faTimesCircle} />
              This isn&rsquo;t my provider
            </button>
          </div>
        </>
      )}

      {/* If confirmed, show a success banner */}
      {alreadyConfirmed && (
        <div className={styles.confirmedBanner}>
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>Access granted. Work can begin.</span>
        </div>
      )}
    </div>
  );
};

export default ClockConfirmCard;
