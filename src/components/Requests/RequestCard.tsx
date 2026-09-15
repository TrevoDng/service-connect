// src/components/Requests/RequestCard.tsx

import React, { useState } from 'react';
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
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import { ConsultationCard } from './ConsultationCard';
import { FinalPricePanel } from './FinalPricePanel';
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

  onProposeFinalPrice?: (request: Booking, amount: number, note: string) => void;
  onAcceptFinalPrice?: (request: Booking) => void;
  onCounterFinalPrice?: (request: Booking, amount: number, note: string) => void;
  onDisputeFinalPrice?: (request: Booking, reason: string) => void;
  onAcceptCounter?: (request: Booking) => void;
  onHoldFirm?: (request: Booking) => void;

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
      return { label: 'Price negotiation', className: styles.statusInfo };
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

const canViewOutcomes = (status: BookingStatus): boolean =>
  status === 'evaluated' ||
  status === 'price_proposed' ||
  status === 'price_agreed' ||
  status === 'in_progress' ||
  status === 'completed' ||
  status === 'price_disputed';

const canViewWorkSession = (status: BookingStatus): boolean =>
  status === 'in_progress' || status === 'completed';

const shouldShowConsultation = (status: BookingStatus): boolean =>
  status !== 'requested';

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
  onAcceptCounter,
  onHoldFirm,
  onViewOutcomes,
  onViewWorkSession,
  compact = false,
}) => {
  const statusSpec = getStatusSpec(request.status);

  // Inline panel state
  const [showProposePanel, setShowProposePanel] = useState(false);
  const [showCounterPanel, setShowCounterPanel] = useState(false);
  const [showDisputePanel, setShowDisputePanel] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

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
  // NEGOTIATION CONTEXT
  // ------------------------------------------
  // What's the current "live" price on the table? (finalPrice or fall back)
  const livePrice = request.finalPrice ?? request.suggestedPrice;

  // Whose turn is it? Undefined = no active negotiation
  const turn = request.pendingCounterParty;

  // Provider-side: they can accept a client's counter when it's their turn
  const providerCanAcceptCounter =
    viewerRole === 'PROVIDER' && turn === 'PROVIDER' && !!onAcceptCounter;

  const providerCanHoldFirm =
    viewerRole === 'PROVIDER' && turn === 'PROVIDER' && !!onHoldFirm;

  // Client-side after provider holds firm
  const clientSeesHoldFirm =
    viewerRole === 'CLIENT' && turn === 'CLIENT' && request.holdFirm === true;

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
      onProposeFinalPrice &&
      !showProposePanel
    ) {
      actions.push(
        <button
          key="propose"
          type="button"
          className={styles.primaryBtn}
          onClick={() => setShowProposePanel(true)}
        >
          <FontAwesomeIcon icon={faDollarSign} />
          Propose final price
        </button>
      );
    }

    // -------- CLIENT: accept / counter / dispute (initial proposal) --------
    if ( canRespondToPrice(viewerRole) &&
  request.status === 'price_proposed' &&
  turn === 'CLIENT' &&
  !request.holdFirm
 // no counter in progress — client is responding to the initial
    ) {
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
      if (onCounterFinalPrice && !showCounterPanel) {
        actions.push(
          <button
            key="counter-price"
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setShowCounterPanel(true)}
          >
            Counter
          </button>
        );
      }
      if (onDisputeFinalPrice && !showDisputePanel) {
        actions.push(
          <button
            key="dispute-price"
            type="button"
            className={styles.dangerBtn}
            onClick={() => setShowDisputePanel(true)}
          >
            <FontAwesomeIcon icon={faGavel} />
            Dispute
          </button>
        );
      }
    }

    // -------- PROVIDER: accept client's counter / hold firm --------
    if (providerCanAcceptCounter) {
      actions.push(
        <button
          key="accept-counter"
          type="button"
          className={styles.primaryBtn}
          onClick={() => onAcceptCounter!(request)}
        >
          <FontAwesomeIcon icon={faHandshake} />
          Accept counter
        </button>
      );
    }
    if (providerCanHoldFirm) {
      actions.push(
        <button
          key="hold-firm"
          type="button"
          className={styles.secondaryBtn}
          onClick={() => onHoldFirm!(request)}
        >
          <FontAwesomeIcon icon={faLock} />
          Hold firm
        </button>
      );
    }

    // -------- CLIENT: accept held-firm original / dispute --------
    if (clientSeesHoldFirm) {
      if (onAcceptFinalPrice) {
        actions.push(
          <button
            key="accept-held"
            type="button"
            className={styles.primaryBtn}
            onClick={() => onAcceptFinalPrice(request)}
          >
            <FontAwesomeIcon icon={faHandshake} />
            Accept original price
          </button>
        );
      }
      if (onDisputeFinalPrice && !showDisputePanel) {
        actions.push(
          <button
            key="dispute-held"
            type="button"
            className={styles.dangerBtn}
            onClick={() => setShowDisputePanel(true)}
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

        {/* Propose final price panel (provider) */}
        {showProposePanel && onProposeFinalPrice && (
          <FinalPricePanel
            mode="propose"
            initialAmount={request.suggestedPrice}
            onSave={(amount, note) => {
              onProposeFinalPrice(request, amount, note);
              setShowProposePanel(false);
            }}
            onCancel={() => setShowProposePanel(false)}
          />
        )}

        {/* Counter panel (client) */}
        {showCounterPanel && onCounterFinalPrice && (
          <FinalPricePanel
            mode="counter"
            currentPrice={livePrice}
            initialAmount={livePrice}
            onSave={(amount, note) => {
              onCounterFinalPrice(request, amount, note);
              setShowCounterPanel(false);
            }}
            onCancel={() => setShowCounterPanel(false)}
          />
        )}

        {/* Dispute panel (client) */}
        {showDisputePanel && onDisputeFinalPrice && (
          <div className={styles.disputePanel}>
            <h4 className={styles.disputeTitle}>Dispute this price</h4>
            <p className={styles.disputeHint}>
              Your dispute will be sent to our support team for review.
            </p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={3}
              className={styles.disputeTextarea}
              placeholder="Explain why you're disputing this price…"
            />
            <div className={styles.disputeActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => {
                  setShowDisputePanel(false);
                  setDisputeReason('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                disabled={!disputeReason.trim()}
                onClick={() => {
                  onDisputeFinalPrice(request, disputeReason.trim());
                  setShowDisputePanel(false);
                  setDisputeReason('');
                }}
              >
                <FontAwesomeIcon icon={faGavel} />
                Submit dispute
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <footer className={styles.actions}>{renderActions()}</footer>
    </article>
  );
};

export default RequestCard;
