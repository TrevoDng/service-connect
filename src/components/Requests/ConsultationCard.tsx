// src/components/Requests/ConsultationCard.tsx

import React, { useState } from 'react';
import type { Booking } from '../../types';
import { canSeeConsultationFeeStatus, type ViewerRole } from '../../types';
import { formatDate, formatDateTime, formatPrice } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faFileInvoiceDollar,
  faCheckCircle,
  faClock,
  faClipboardList,
  faCamera,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import styles from './ConsultationCard.module.scss';

export interface ConsultationCardProps {
  request: Booking;
  viewerRole: ViewerRole;

  /** Client-only: pay the fee */
  onPay?: (booking: Booking) => void;
  /** Provider-only: start the site visit / consultation */
  onStartConsultation?: (booking: Booking) => void;

  /** Start expanded? Defaults to false on mobile, true on desktop */
  defaultExpanded?: boolean;
}

// ============================================
// HELPERS
// ============================================

type ConsultationPhase =
  | 'fee_pending'      // accepted, client hasn't paid
  | 'fee_paid'         // consultation_paid, provider hasn't started
  | 'completed'        // evaluated or later
  | 'closed';          // declined / cancelled / disputed

const getPhase = (status: Booking['status']): ConsultationPhase => {
  switch (status) {
    case 'accepted':
      return 'fee_pending';
    case 'consultation_paid':
      return 'fee_paid';
    case 'evaluated':
    case 'price_proposed':
    case 'price_agreed':
    case 'in_progress':
    case 'completed':
      return 'completed';
    default:
      return 'closed';
  }
};

const getPhaseLabel = (phase: ConsultationPhase): string => {
  switch (phase) {
    case 'fee_pending':
      return 'Awaiting consultation fee';
    case 'fee_paid':
      return 'Fee paid — awaiting site visit';
    case 'completed':
      return 'Consultation completed';
    case 'closed':
      return 'Consultation closed';
  }
};

const getPhaseClass = (phase: ConsultationPhase): string => {
  switch (phase) {
    case 'fee_pending':
      return styles.phasePending;
    case 'fee_paid':
      return styles.phaseInfo;
    case 'completed':
      return styles.phaseSuccess;
    case 'closed':
      return styles.phaseMuted;
  }
};

// ============================================
// COMPONENT
// ============================================

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  request,
  viewerRole,
  onPay,
  onStartConsultation,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const phase = getPhase(request.status);
  const phaseLabel = getPhaseLabel(phase);
  const phaseClass = getPhaseClass(phase);

  const showFeeBadge = canSeeConsultationFeeStatus(viewerRole);
  const feePaid = !!request.consultationPaidAt;

  const hasPhotos =
    request.consultationPhotos && request.consultationPhotos.length > 0;
  const hasNotes = !!request.consultationNotes;

  // Don't render for statuses where there's nothing to consult yet
  if (request.status === 'requested') {
    return null;
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={styles.card}>
      {/* Header — always visible, toggles expansion */}
      <button
        type="button"
        className={styles.header}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className={styles.headerLeft}>
          <span className={`${styles.phaseBadge} ${phaseClass}`}>
            {phase === 'completed' ? (
              <FontAwesomeIcon icon={faCheckCircle} />
            ) : phase === 'fee_paid' ? (
              <FontAwesomeIcon icon={faClipboardList} />
            ) : (
              <FontAwesomeIcon icon={faClock} />
            )}
            {phaseLabel}
          </span>

          {/* Client-only: fee paid/unpaid badge */}
          {showFeeBadge &&
            phase !== 'closed' &&
            request.status !== 'accepted' && (
              <span
                className={`${styles.feeBadge} ${
                  feePaid ? styles.feePaid : styles.feeUnpaid
                }`}
              >
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                {feePaid ? 'Fee paid' : 'Fee unpaid'}
              </span>
            )}
        </div>

        <div className={styles.headerRight}>
          {request.consultationFee > 0 && (
            <span className={styles.feeAmount}>
              {formatPrice(request.consultationFee)}
            </span>
          )}
          <FontAwesomeIcon
            icon={expanded ? faChevronUp : faChevronDown}
            className={styles.chevron}
          />
        </div>
      </button>

      {/* Body — collapsed by default */}
      {expanded && (
        <div className={styles.body}>
          {/* Summary grid */}
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Consultation fee</span>
              <span className={styles.summaryValue}>
                {request.consultationFee > 0
                  ? formatPrice(request.consultationFee)
                  : '—'}
              </span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Site visit</span>
              <span className={styles.summaryValue}>
                {request.siteVisited ? 'Completed' : 'Not yet'}
              </span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Photos</span>
              <span className={styles.summaryValue}>
                {hasPhotos ? `${request.consultationPhotos!.length}` : '—'}
              </span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Notes</span>
              <span className={styles.summaryValue}>
                {hasNotes ? 'Provided' : '—'}
              </span>
            </div>
          </div>

          {/* Notes */}
          {hasNotes && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Findings</h4>
              <p className={styles.notes}>{request.consultationNotes}</p>
            </div>
          )}

          {/* Photos */}
          {hasPhotos && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faCamera} /> Site photos
              </h4>
              <div className={styles.photoGrid}>
                {request.consultationPhotos!.map((url, i) => (
                  <figure key={i} className={styles.photoTile}>
                    <img
                      src={url}
                      alt={`Consultation photo ${i + 1}`}
                      loading="lazy"
                    />
                  </figure>
                ))}
              </div>
            </div>
          )}

          {/* Fee payment details — client only */}
          {showFeeBadge && request.consultationPaidAt && (
            <div className={styles.paymentRow}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>
                Fee paid on {formatDateTime(request.consultationPaidAt)}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            {/* Client: pay */}
            {viewerRole === 'CLIENT' &&
              phase === 'fee_pending' &&
              onPay && (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => onPay(request)}
                >
                  <FontAwesomeIcon icon={faFileInvoiceDollar} />
                  Pay consultation fee
                </button>
              )}

            {/* Provider: start visit */}
            {viewerRole === 'PROVIDER' &&
              phase === 'fee_paid' &&
              onStartConsultation && (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => onStartConsultation(request)}
                >
                  <FontAwesomeIcon icon={faPlay} />
                  Start consultation
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationCard;
