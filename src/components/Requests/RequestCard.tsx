// src/components/Requests/RequestCard.tsx

import React from 'react';
import type { Booking, BookingStatus } from '../../types';
import {
  canAcceptRequest,
  canPayConsultation,
  canProposePrice,
  canRespondToPrice,
  canSeeConsultationFeeStatus,
  type ViewerRole,
} from '../../types';
import { formatDate, formatPrice, formatRelative } from '../../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faTimes,
  faEye,
  faFileInvoiceDollar,
  faArrowRight,
  faDollarSign,
  faHandshake,
  faFlagCheckered,
  faGavel,
  faKey,
  faCamera,
} from '@fortawesome/free-solid-svg-icons';
import styles from './RequestCard.module.scss';

// ============================================
// PROPS
// ============================================

export interface RequestCardProps {
  request: Booking;
  viewerRole: ViewerRole;

  /** Open the full request detail (all roles) */
  onOpen?: (request: Booking) => void;

  /** Provider-only: accept the request */
  onAccept?: (request: Booking) => void;
  /** Provider-only: decline the request */
  onDecline?: (request: Booking) => void;

  /** Client-only: pay the consultation fee */
  onPayConsultation?: (request: Booking) => void;

  /** Provider-only: propose the final price */
  onProposeFinalPrice?: (request: Booking) => void;
  /** Client-only: accept the proposed final price */
  onAcceptFinalPrice?: (request: Booking) => void;
  /** Client-only: counter the proposed final price */
  onCounterFinalPrice?: (request: Booking) => void;
  /** Client-only: dispute the proposed final price */
  onDisputeFinalPrice?: (request: Booking) => void;

  /** All roles: open the Consultation Final Outcomes page */
  onViewOutcomes?: (request: Booking) => void;
  /** All roles: open the live work session */
  onViewWorkSession?: (request: Booking) => void;

  /** Compact mode: smaller paddings, hides some meta */
  compact?: boolean;
}

// ============================================
// STATUS CONFIG
// ============================================

interface StatusSpec {
  label: string;
  className: string;   // matches a module class
}

const getStatusSpec = (status: BookingStatus): StatusSpec => {
  switch (status) {
    case 'requested':
      return { label: 'Awaiting provider', className: styles.statusPending };
    case 'accepted':
      return { label: 'Accepted — consultation pending', className: styles.statusInfo };
    case 'consultation_paid':
      return { label: 'Consultation paid', className: styles.statusInfo };
    case 'evaluated':
      return { label: 'Site evaluated', className: styles.statusInfo };
    case 'price_proposed':
      return { label: 'Final price proposed', className: styles.statusInfo };
    case 'price_agreed':
      return { label: 'Price agreed', className: styles.statusSuccess };
    case 'in_progress':
      return { label: 'Work in progress', className: styles.statusSuccess };
    case 'completed':
      return { label: 'Completed', className: styles.statusSuccess };
    case 'declined':
      return { label: 'Declined', className: styles.statusDanger };
    case 'cancelled':
      return { label: 'Cancelled', className: styles.statusMuted };
    case 'price_disputed':
      return { label: 'Price disputed', className: styles.statusDanger };
    default:
      return { label: status, className: styles.statusMuted };
  }
};

// ============================================
// HELPERS
// ============================================

// "Outcomes" button only appears when there are outcomes to show.
// Per plan: status is 'evaluated' or later.
const canViewOutcomes = (status: BookingStatus): boolean => {
  return (
    status === 'evaluated' ||
    status === 'price_proposed' ||
    status === 'price_agreed' ||
    status === 'in_progress' ||
    status === 'completed' ||
    status === 'price_disputed'
  );
};

const canViewWorkSession = (status: BookingStatus): boolean => {
  return status === 'in_progress' || status === 'completed';
};

// ============================================
// COMPONENT
// ============================================

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  viewerRole,
  onOpen,
  onAccept,
  onDecline,
  onPayConsultation,
  onProposeFinalPrice,
  onAcceptFinalPrice,
  onCounterFinalPrice,
  onDisputeFinalPrice,
  onViewOutcomes,
  onViewWorkSession,
  compact = false,
}) => {
  const statusSpec = getStatusSpec(request.status);

  // Which counterpart name to show
  const counterpartName =
    viewerRole === 'CLIENT'
      ? request.providerDisplayName
      : request.clientDisplayName;
  const counterpartLabel = viewerRole === 'CLIENT' ? 'Provider' : 'Client';

  // Should we show the consultation fee paid badge?
  const showFeeBadge = canSeeConsultationFeeStatus(viewerRole);
  const feePaid = !!request.consultationPaidAt;

  // Photo preview (max 3 + overflow count)
  const previewPhotos = request.requestPhotos.slice(0, 3);
  const extraPhotoCount = Math.max(0, request.requestPhotos.length - 3);

  // -------------- ACTION BUTTONS BY STATUS --------------

  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    // -------- PROVIDER ACTIONS --------
    if (canAcceptRequest(viewerRole)) {
      if (request.status === 'requested') {
        if (onAccept) {
          actions.push(
            <button
              key="accept"
              type="button"
              className={styles.primaryBtn}
              onClick={() => onAccept(request)}
            >
              <FontAwesomeIcon icon={faCheck} />
              Accept
            </button>
          );
        }
        if (onDecline) {
          actions.push(
            <button
              key="decline"
              type="button"
              className={styles.dangerBtn}
              onClick={() => onDecline(request)}
            >
              <FontAwesomeIcon icon={faTimes} />
              Decline
            </button>
          );
        }
      }

      if (request.status === 'evaluated' && canProposePrice(viewerRole) && onProposeFinalPrice) {
        actions.push(
          <button
            key="propose"
            type="button"
            className={styles.primaryBtn}
            onClick={() => onProposeFinalPrice(request)}
          >
            <FontAwesomeIcon icon={faDollarSign} />
            Propose final price
          </button>
        );
      }
    }

    // -------- CLIENT ACTIONS --------
    if (canPayConsultation(viewerRole)) {
      if (request.status === 'accepted' && onPayConsultation) {
        actions.push(
          <button
            key="pay"
            type="button"
            className={styles.primaryBtn}
            onClick={() => onPayConsultation(request)}
          >
            <FontAwesomeIcon icon={faFileInvoiceDollar} />
            Pay consultation fee
          </button>
        );
      }
    }

    if (canRespondToPrice(viewerRole) && request.status === 'price_proposed') {
      if (onAcceptFinalPrice) {
        actions.push(
          <button
            key="accept-price"
            type="button"
            className={styles.primaryBtn}
            onClick={() => onAcceptFinalPrice(request)}
          >
            <FontAwesomeIcon icon={faHandshake} />
            Accept price
          </button>
        );
      }
      if (onCounterFinalPrice) {
        actions.push(
          <button
            key="counter-price"
            type="button"
            className={styles.secondaryBtn}
            onClick={() => onCounterFinalPrice(request)}
          >
            Counter
          </button>
        );
      }
      if (onDisputeFinalPrice) {
        actions.push(
          <button
            key="dispute-price"
            type="button"
            className={styles.dangerBtn}
            onClick={() => onDisputeFinalPrice(request)}
          >
            <FontAwesomeIcon icon={faGavel} />
            Dispute
          </button>
        );
      }
    }

    // -------- SHARED ACTIONS (all roles) --------
    if (onViewWorkSession && canViewWorkSession(request.status)) {
      actions.push(
        <button
          key="work-session"
          type="button"
          className={styles.secondaryBtn}
          onClick={() => onViewWorkSession(request)}
        >
          <FontAwesomeIcon icon={faKey} />
          View work session
        </button>
      );
    }

    if (onViewOutcomes && canViewOutcomes(request.status)) {
      actions.push(
        <button
          key="outcomes"
          type="button"
          className={styles.secondaryBtn}
          onClick={() => onViewOutcomes(request)}
        >
          <FontAwesomeIcon icon={faFlagCheckered} />
          View outcomes
        </button>
      );
    }

    // -------- OPEN DETAIL (fallback / always available) --------
    if (onOpen) {
      actions.push(
        <button
          key="open"
          type="button"
          className={styles.ghostBtn}
          onClick={() => onOpen(request)}
        >
          <FontAwesomeIcon icon={faEye} />
          View details
        </button>
      );
    }

    return actions.length > 0 ? actions : null;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <article
      className={`${styles.card} ${compact ? styles.compact : ''}`}
    >
      {/* Header: ref + status + timestamp */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.ref}>{request.requestRef}</span>
          <span className={`${styles.statusBadge} ${statusSpec.className}`}>
            {statusSpec.label}
          </span>

          {showFeeBadge && request.status !== 'requested' && request.status !== 'declined' && (
            <span
              className={`${styles.feeBadge} ${
                feePaid ? styles.feePaid : styles.feeUnpaid
              }`}
              title={feePaid ? 'Consultation fee paid' : 'Consultation fee pending'}
            >
              <FontAwesomeIcon icon={faFileInvoiceDollar} />
              {feePaid ? 'Fee paid' : 'Fee unpaid'}
            </span>
          )}
        </div>

        <span className={styles.timestamp}>
          {formatRelative(request.updatedAt)}
        </span>
      </header>

      {/* Body */}
      <div className={styles.body}>
        <h3 className={styles.title}>{request.serviceTitle}</h3>
        <p className={styles.category}>{request.serviceCategory}</p>

        <div className={styles.metaGrid}>
          <div className={styles.meta}>
            <span className={styles.metaLabel}>{counterpartLabel}:</span>
            <span className={styles.metaValue}>{counterpartName}</span>
          </div>

          <div className={styles.meta}>
            <span className={styles.metaLabel}>Requested for:</span>
            <span className={styles.metaValue}>
              {formatDate(request.requestedDate)}
            </span>
          </div>

          <div className={styles.meta}>
            <span className={styles.metaLabel}>Suggested price:</span>
            <span className={styles.metaValue}>
              {formatPrice(request.suggestedPrice)}
              <span className={styles.helper} title="Not binding — final price after evaluation">
                {' '}(suggestion)
              </span>
            </span>
          </div>

          {request.finalPrice !== undefined && (
            <div className={styles.meta}>
              <span className={styles.metaLabel}>Final price:</span>
              <span className={`${styles.metaValue} ${styles.finalPrice}`}>
                {formatPrice(request.finalPrice)}
              </span>
            </div>
          )}
        </div>

        {!compact && request.description && (
          <p className={styles.description}>{request.description}</p>
        )}

        {/* Request photos preview */}
        {request.requestPhotos.length > 0 && !compact && (
          <div className={styles.photoStrip}>
            {previewPhotos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Request photo ${i + 1}`}
                className={styles.photoThumb}
                loading="lazy"
              />
            ))}
            {extraPhotoCount > 0 && (
              <span className={styles.photoMore}>+{extraPhotoCount}</span>
            )}
            <span className={styles.photoCountLabel}>
              <FontAwesomeIcon icon={faCamera} /> {request.requestPhotos.length}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <footer className={styles.actions}>{renderActions()}</footer>
    </article>
  );
};

export default RequestCard;
