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
  faDollarSign,
  faHandshake,
  faFlagCheckered,
  faGavel,
  faKey,
  faCamera,
} from '@fortawesome/free-solid-svg-icons';
import { ConsultationCard } from './ConsultationCard';
import styles from './RequestCard.module.scss';

// ============================================
// PROPS
// ============================================

export interface RequestCardProps {
  request: Booking;
  viewerRole: ViewerRole;

  onOpen?: (request: Booking) => void;

  onAccept?: (request: Booking) => void;
  onDecline?: (request: Booking) => void;

  onPayConsultation?: (request: Booking) => void;
  onStartConsultation?: (request: Booking) => void;

  onProposeFinalPrice?: (request: Booking) => void;
  onAcceptFinalPrice?: (request: Booking) => void;
  onCounterFinalPrice?: (request: Booking) => void;
  onDisputeFinalPrice?: (request: Booking) => void;

  onViewOutcomes?: (request: Booking) => void;
  onViewWorkSession?: (request: Booking) => void;

  compact?: boolean;
}

// ============================================
// STATUS CONFIG
// ============================================

interface StatusSpec {
  label: string;
  className: string;
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

const shouldShowConsultation = (status: BookingStatus): boolean => {
  // Render ConsultationCard for anything past 'requested'
  return status !== 'requested';
};

// Client-side default — expand on desktop, collapse on mobile.
// Cheap one-liner, doesn't need React state.
const defaultConsultationExpanded = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth > 768;
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
  onStartConsultation,
  onProposeFinalPrice,
  onAcceptFinalPrice,
  onCounterFinalPrice,
  onDisputeFinalPrice,
  onViewOutcomes,
  onViewWorkSession,
  compact = false,
}) => {
  const statusSpec = getStatusSpec(request.status);

  const counterpartName =
    viewerRole === 'CLIENT'
      ? request.providerDisplayName
      : request.clientDisplayName;
  const counterpartLabel = viewerRole === 'CLIENT' ? 'Provider' : 'Client';

  const showFeeBadge = canSeeConsultationFeeStatus(viewerRole);
  const feePaid = !!request.consultationPaidAt;

  const previewPhotos = request.requestPhotos.slice(0, 3);
  const extraPhotoCount = Math.max(0, request.requestPhotos.length - 3);

  // ------------------------------------------
  // ACTIONS
  // ------------------------------------------
  const renderActions = () => {
    const actions: React.ReactNode[] = [];

    // -------- PROVIDER: accept / decline --------
    if (canAcceptRequest(viewerRole) && request.status === 'requested') {
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

    // -------- CLIENT: pay consultation --------
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

    // -------- PROVIDER: propose final price --------
    if (
      request.status === 'evaluated' &&
      canProposePrice(viewerRole) &&
      onProposeFinalPrice
    ) {
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

    // -------- CLIENT: accept / counter / dispute price --------
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

    // -------- SHARED --------
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
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.ref}>{request.requestRef}</span>
          <span className={`${styles.statusBadge} ${statusSpec.className}`}>
            {statusSpec.label}
          </span>

          {showFeeBadge &&
            request.status !== 'requested' &&
            request.status !== 'declined' && (
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
              <span className={styles.helper} title="Not binding">
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

        {/* Consultation (collapsible, shared) */}
        {shouldShowConsultation(request.status) && (
          <div className={styles.consultationWrapper}>
            <ConsultationCard
              request={request}
              viewerRole={viewerRole}
              onPay={onPayConsultation}
              onStartConsultation={onStartConsultation}
              defaultExpanded={defaultConsultationExpanded()}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <footer className={styles.actions}>{renderActions()}</footer>
    </article>
  );
};

export default RequestCard;
