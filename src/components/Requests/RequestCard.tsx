// src/components/Requests/RequestCard.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  Booking,
  BookingStatus,
  Review,
  ReviewFormData,
  Dispute,
  RaiseDisputeFormData,
} from '../../types';
import { WizardStep } from './WizardStep';
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
  faStar,
  faComment,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { ConsultationCard } from './ConsultationCard';
import { FinalPricePanel } from './FinalPricePanel';
import { LeaveReviewPanel } from './LeaveReviewPanel';
import { RaiseDisputePanel } from './RaiseDisputePanel';
import { getReviewForBooking } from '../../utils/allReviews';
import { addLocalReview, setProviderReply } from '../../utils/localReviews';
import { getDisputeByBooking } from '../../utils/allDisputes';
import { addLocalDispute, addDisputeMessage } from '../../utils/localDisputes';
import { generateId } from '../../utils/referenceCode';
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
  onReviewSubmitted?: () => void;
  onDisputeChanged?: () => void;

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

// Statuses where the wizard view is appropriate (active journey)
const isActiveStatus = (status: BookingStatus): boolean =>
  status === 'requested' ||
  status === 'accepted' ||
  status === 'consultation_paid' ||
  status === 'evaluated' ||
  status === 'price_proposed' ||
  status === 'price_agreed' ||
  status === 'in_progress';

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
  onReviewSubmitted,
  onDisputeChanged,
  compact = false,
}) => {
  const statusSpec = getStatusSpec(request.status);

  // ------------------------------------------
  // PANEL STATE
  // ------------------------------------------
  const [showProposePanel, setShowProposePanel] = useState(false);
  const [showCounterPanel, setShowCounterPanel] = useState(false);
  const [showPriceDisputePanel, setShowPriceDisputePanel] = useState(false);
  const [priceDisputeReason, setPriceDisputeReason] = useState('');

  // Review state
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [reviewReplyOpen, setReviewReplyOpen] = useState(false);
  const [reviewReplyText, setReviewReplyText] = useState('');

  // Dispute state (Step 9)
  const [showRaiseDisputePanel, setShowRaiseDisputePanel] = useState(false);
  // Wizard vs detailed view
const [showFullDetails, setShowFullDetails] = useState(false);

  // ------------------------------------------
  // DERIVED DATA
  // ------------------------------------------
  const existingReview = getReviewForBooking(request.id);
  const existingDispute: Dispute | undefined = getDisputeByBooking(request.id);

  const canRaiseDispute =
    (viewerRole === 'CLIENT' || viewerRole === 'PROVIDER') &&
    request.status !== 'requested' &&
    request.status !== 'cancelled' &&
    !existingDispute;

  const counterpartName =
    viewerRole === 'CLIENT'
      ? request.providerDisplayName
      : request.clientDisplayName;
  const counterpartLabel = viewerRole === 'CLIENT' ? 'Provider' : 'Client';

  const showFeeBadge = canSeeConsultationFeeStatus(viewerRole);
  const feePaid = !!request.consultationPaidAt;

  const previewPhotos = request.requestPhotos.slice(0, 3);
  const extraPhotoCount = Math.max(0, request.requestPhotos.length - 3);

  // Negotiation
  const livePrice = request.finalPrice ?? request.suggestedPrice;
  const turn = request.pendingCounterParty;

  const providerCanAcceptCounter =
    viewerRole === 'PROVIDER' && turn === 'PROVIDER' && !!onAcceptCounter;

  const providerCanHoldFirm =
    viewerRole === 'PROVIDER' && turn === 'PROVIDER' && !!onHoldFirm;

  const clientSeesHoldFirm =
    viewerRole === 'CLIENT' && turn === 'CLIENT' && request.holdFirm === true;

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const handleSubmitReview = (args: { id: string; formData: ReviewFormData }) => {
    const review: Review = {
      id: args.id,
      bookingId: request.id,
      clientId: request.clientId,
      clientDisplayName: request.clientDisplayName,
      providerId: request.providerId,
      providerDisplayName: request.providerDisplayName,
      rating: args.formData.rating,
      comment: args.formData.comment,
      photos: args.formData.photos,
      tags: args.formData.tags,
      wouldRecommend: args.formData.wouldRecommend,
      createdAt: new Date().toISOString(),
    };
    addLocalReview(review);
    setShowReviewPanel(false);
    if (onReviewSubmitted) onReviewSubmitted();
  };

  const handleSubmitReply = () => {
    if (!existingReview || !reviewReplyText.trim()) return;
    setProviderReply(existingReview.id, reviewReplyText.trim());
    setReviewReplyOpen(false);
    setReviewReplyText('');
    if (onReviewSubmitted) onReviewSubmitted();
  };

  const handleRaiseDispute = (form: RaiseDisputeFormData) => {
    const now = new Date().toISOString();
    const isClient = viewerRole === 'CLIENT';

    const raisedByUserId = isClient ? request.clientId : request.providerId;
    const raisedByDisplayName = isClient
      ? request.clientDisplayName
      : request.providerDisplayName;
    const againstUserId = isClient ? request.providerId : request.clientId;
    const againstDisplayName = isClient
      ? request.providerDisplayName
      : request.clientDisplayName;

    const dispute: Dispute = {
      id: generateId(),
      bookingId: request.id,
      requestRef: request.requestRef,
      raisedByUserId,
      raisedByRole: viewerRole === 'CLIENT' ? 'CLIENT' : 'PROVIDER',
      raisedByDisplayName,
      againstUserId,
      againstRole: isClient ? 'PROVIDER' : 'CLIENT',
      againstDisplayName,
      category: form.category,
      reason: form.reason,
      photos: form.photos,
      status: 'open',
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    addLocalDispute(dispute);

    addDisputeMessage(dispute.id, {
      authorId: 'system',
      authorDisplayName: 'ServiceConnect',
      authorRole: 'SYSTEM',
      text: `Dispute raised by ${raisedByDisplayName}. A support agent will review this and respond shortly.`,
      internal: false,
    });

    setShowRaiseDisputePanel(false);
    if (onDisputeChanged) onDisputeChanged();
  };

  // ------------------------------------------
// WIZARD ACTION DISPATCHER
// ------------------------------------------
// Translates wizard step action keys to the existing handlers.
const handleWizardAction = (actionKey: string, b: Booking) => {
  switch (actionKey) {
    case 'accept':
      if (onAccept) onAccept(b);
      break;
    case 'decline':
      if (onDecline) onDecline(b);
      break;
    case 'pay':
      if (onPayConsultation) onPayConsultation(b);
      break;
    case 'start-consultation':
      if (onStartConsultation) onStartConsultation(b);
      break;
    case 'propose-price':
      setShowProposePanel(true);
      break;
    case 'accept-price':
      if (onAcceptFinalPrice) onAcceptFinalPrice(b);
      break;
    case 'counter-price':
      setShowCounterPanel(true);
      break;
    case 'dispute-price':
      setShowPriceDisputePanel(true);
      break;
    case 'accept-counter':
      if (onAcceptCounter) onAcceptCounter(b);
      break;
    case 'hold-firm':
      if (onHoldFirm) onHoldFirm(b);
      break;
    case 'view-work-session':
      if (onViewWorkSession) onViewWorkSession(b);
      break;
    case 'open-dispute':
      setShowRaiseDisputePanel(true);
      break;
    default:
      // Unknown action — no-op
      break;
  }
};

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
    if (canPayConsultation(viewerRole) && request.status === 'accepted' && onPayConsultation) {
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

    // -------- CLIENT: accept / counter / dispute --------
    if (
      canRespondToPrice(viewerRole) &&
      request.status === 'price_proposed' &&
      turn === 'CLIENT' &&
      !request.holdFirm
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
      if (onDisputeFinalPrice && !showPriceDisputePanel) {
        actions.push(
          <button
            key="dispute-price"
            type="button"
            className={styles.dangerBtn}
            onClick={() => setShowPriceDisputePanel(true)}
          >
            <FontAwesomeIcon icon={faGavel} />
            Dispute
          </button>
        );
      }
    }

    // -------- PROVIDER: accept counter / hold firm --------
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

    // -------- CLIENT: accept held-firm / dispute --------
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
      if (onDisputeFinalPrice && !showPriceDisputePanel) {
        actions.push(
          <button
            key="dispute-held"
            type="button"
            className={styles.dangerBtn}
            onClick={() => setShowPriceDisputePanel(true)}
          >
            <FontAwesomeIcon icon={faGavel} />
            Dispute
          </button>
        );
      }
    }

    // -------- CLIENT: leave review --------
    if (
      viewerRole === 'CLIENT' &&
      request.status === 'completed' &&
      !existingReview &&
      !showReviewPanel
    ) {
      actions.push(
        <button
          key="leave-review"
          type="button"
          className={styles.primaryBtn}
          onClick={() => setShowReviewPanel(true)}
        >
          <FontAwesomeIcon icon={faStar} />
          Leave review
        </button>
      );
    }

    // -------- Either party: raise dispute --------
    if (canRaiseDispute && !showRaiseDisputePanel) {
      actions.push(
        <button
          key="raise-dispute"
          type="button"
          className={styles.dangerBtn}
          onClick={() => setShowRaiseDisputePanel(true)}
        >
          <FontAwesomeIcon icon={faGavel} />
          Raise dispute
        </button>
      );
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
// WIZARD VIEW (active bookings, focus mode)
// ============================================
//
// For active statuses, render the guided step instead of the full card,
// unless the user has explicitly requested the detailed view.

if (
  isActiveStatus(request.status) &&
  !showFullDetails &&
  (viewerRole === 'CLIENT' || viewerRole === 'PROVIDER')
) {
  return (
    <WizardStep
      booking={request}
      viewerRole={viewerRole}
      expanded={false}
      onToggleExpanded={() => setShowFullDetails(true)}
      onAction={handleWizardAction}
    />
  );
}

  // ============================================
  // RENDER
  // ============================================

  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
  {/* "Back to wizard" pill — only shown when user expanded from wizard */}
  {isActiveStatus(request.status) &&
    showFullDetails &&
    (viewerRole === 'CLIENT' || viewerRole === 'PROVIDER') && (
      <button
        type="button"
        className={styles.backToWizardBtn}
        onClick={() => setShowFullDetails(false)}
      >
        ← Back to guided view
      </button>
    )}
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
               {viewerRole === 'CLIENT' ? (
             <Link
               to={`/providers/${request.providerId}`}
                className={styles.metaLink}
                 >
                 {counterpartName}
                  </Link>
                  ) : (
                 <span className={styles.metaValue}>{counterpartName}</span>
                  )}
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

        {/* Consultation */}
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

        {/* Price agreed — provider */}
        {viewerRole === 'PROVIDER' &&
          request.status === 'price_agreed' &&
          request.finalPrice !== undefined && (
            <div className={styles.agreedBanner}>
              <FontAwesomeIcon icon={faHandshake} />
              <div>
                <strong>Client accepted your price</strong>
                <span>
                  {formatPrice(request.finalPrice)} agreed. You're ready to
                  start the work session.
                </span>
              </div>
            </div>
          )}

        {/* Price agreed — client */}
        {viewerRole === 'CLIENT' &&
          request.status === 'price_agreed' &&
          request.finalPrice !== undefined && (
            <div className={styles.agreedBanner}>
              <FontAwesomeIcon icon={faHandshake} />
              <div>
                <strong>Price agreed</strong>
                <span>
                  {request.providerDisplayName} will begin the work and clock
                  in on the agreed date.
                </span>
              </div>
            </div>
          )}

        {/* Price disputed — provider */}
        {viewerRole === 'PROVIDER' && request.status === 'price_disputed' && (
          <div className={styles.disputeInfoBanner}>
            <FontAwesomeIcon icon={faGavel} />
            <div>
              <strong>Client disputed the price</strong>
              <span>
                Our support team will review this. You'll be contacted shortly.
              </span>
            </div>
          </div>
        )}

        {/* Price disputed — client */}
        {viewerRole === 'CLIENT' && request.status === 'price_disputed' && (
          <div className={styles.disputeInfoBanner}>
            <FontAwesomeIcon icon={faGavel} />
            <div>
              <strong>Dispute submitted</strong>
              <span>
                Our support team will review your dispute and contact you
                shortly.
              </span>
            </div>
          </div>
        )}

        {/* Dispute banner (Step 9) */}
        {existingDispute && (
          <div
            className={`${styles.disputeBanner} ${
              existingDispute.status === 'resolved' ||
              existingDispute.status === 'closed'
                ? styles.disputeBannerResolved
                : ''
            }`}
          >
            <FontAwesomeIcon icon={faCircleExclamation} />
            <div>
              <strong>
                Dispute{' '}
                {existingDispute.status === 'open' ||
                existingDispute.status === 'awaiting_info'
                  ? 'in progress'
                  : 'resolved'}
              </strong>
              <span>
                Raised by {existingDispute.raisedByDisplayName} ·{' '}
                {new Date(existingDispute.createdAt).toLocaleDateString('en-ZA')}
                {existingDispute.resolutionNote && (
                  <> · {existingDispute.resolutionNote}</>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Raise dispute panel */}
        {showRaiseDisputePanel && (
          <RaiseDisputePanel
            againstName={
              viewerRole === 'CLIENT'
                ? request.providerDisplayName
                : request.clientDisplayName
            }
            serviceTitle={request.serviceTitle}
            onSubmit={handleRaiseDispute}
            onCancel={() => setShowRaiseDisputePanel(false)}
          />
        )}

        {/* Existing review */}
        {existingReview && (
          <div className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <span className={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <FontAwesomeIcon
                    key={n}
                    icon={faStar}
                    className={
                      n <= existingReview.rating ? styles.starOn : styles.starOff
                    }
                  />
                ))}
              </span>
              <span className={styles.reviewBy}>
                by {existingReview.clientDisplayName}
              </span>
            </div>
            {existingReview.comment && (
              <p className={styles.reviewComment}>{existingReview.comment}</p>
            )}
            {existingReview.tags && existingReview.tags.length > 0 && (
              <div className={styles.reviewTags}>
                {existingReview.tags.map((t) => (
                  <span key={t} className={styles.reviewTag}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {existingReview.providerReply ? (
              <div className={styles.providerReply}>
                <strong>Provider reply</strong>
                <p>{existingReview.providerReply.text}</p>
              </div>
            ) : (
              viewerRole === 'PROVIDER' &&
              !reviewReplyOpen && (
                <button
                  type="button"
                  className={styles.replyBtn}
                  onClick={() => setReviewReplyOpen(true)}
                >
                  <FontAwesomeIcon icon={faComment} />
                  Reply
                </button>
              )
            )}

            {reviewReplyOpen && viewerRole === 'PROVIDER' && (
              <div className={styles.replyForm}>
                <textarea
                  value={reviewReplyText}
                  onChange={(e) => setReviewReplyText(e.target.value)}
                  rows={2}
                  className={styles.replyTextarea}
                  placeholder="Reply publicly to this review…"
                />
                <div className={styles.replyActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setReviewReplyOpen(false);
                      setReviewReplyText('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    disabled={!reviewReplyText.trim()}
                    onClick={handleSubmitReply}
                  >
                    Post reply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leave review panel */}
        {showReviewPanel && !existingReview && (
          <LeaveReviewPanel
            providerName={request.providerDisplayName}
            serviceTitle={request.serviceTitle}
            providerId={request.providerId}
            clientId={request.clientId}
            clientDisplayName={request.clientDisplayName}
            bookingId={request.id}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewPanel(false)}
          />
        )}

        {/* Propose final price */}
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

        {/* Counter panel */}
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

        {/* Price dispute panel (Step 7h) */}
        {showPriceDisputePanel && onDisputeFinalPrice && (
          <div className={styles.disputePanel}>
            <h4 className={styles.disputeTitle}>Dispute this price</h4>
            <p className={styles.disputeHint}>
              Your dispute will be sent to our support team for review.
            </p>
            <textarea
              value={priceDisputeReason}
              onChange={(e) => setPriceDisputeReason(e.target.value)}
              rows={3}
              className={styles.disputeTextarea}
              placeholder="Explain why you're disputing this price…"
            />
            <div className={styles.disputeActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => {
                  setShowPriceDisputePanel(false);
                  setPriceDisputeReason('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                disabled={!priceDisputeReason.trim()}
                onClick={() => {
                  onDisputeFinalPrice(request, priceDisputeReason.trim());
                  setShowPriceDisputePanel(false);
                  setPriceDisputeReason('');
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
