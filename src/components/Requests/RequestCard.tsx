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
import { LeaveReviewPanel } from './LeaveReviewPanel';
import type { Review, ReviewFormData } from '../../types';
import { getReviewForBooking } from '../../utils/allReviews';
import { addLocalReview, setProviderReply } from '../../utils/localReviews';
import { generateId } from '../../utils/referenceCode';
import { RaiseDisputePanel } from './RaiseDisputePanel';
import type { RaiseDisputeFormData, Dispute } from '../../types';
import { getDisputeByBooking } from '../../utils/allDisputes';
import {
  addLocalDispute,
  addDisputeMessage,
} from '../../utils/localDisputes';
import { generateId } from '../../utils/referenceCode';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { faStar, faComment } from '@fortawesome/free-solid-svg-icons';
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
  /** Fired after a review is submitted. Parent should refresh. */
  onReviewSubmitted?: () => void;

  compact?: boolean;
  onDisputeChanged?: () => void;
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
  onReviewSubmitted,
  onDisputeChanged,
  compact = false,
}) => {
  const statusSpec = getStatusSpec(request.status);

  // Inline panel state
  const [showProposePanel, setShowProposePanel] = useState(false);
  const [showCounterPanel, setShowCounterPanel] = useState(false);
  const [showDisputePanel, setShowDisputePanel] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  // Review code section
  const [showReviewPanel, setShowReviewPanel] = useState(false);
const [reviewReplyOpen, setReviewReplyOpen] = useState(false);
const [reviewReplyText, setReviewReplyText] = useState('');

// Read any existing review for this booking
const existingReview = getReviewForBooking(request.id);

const [showDisputePanel, setShowDisputePanel] = useState(false);
const existingDispute: Dispute | undefined = getDisputeByBooking(request.id);

// Can the current viewer raise a dispute?
const canRaiseDispute =
  (viewerRole === 'CLIENT' || viewerRole === 'PROVIDER') &&
  request.status !== 'requested' &&
  request.status !== 'cancelled' &&
  !existingDispute;

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
    raisedByRole: viewerRole,
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

  // Seed an initial system message so the thread isn't empty
  addDisputeMessage(dispute.id, {
    authorId: 'system',
    authorDisplayName: 'ServiceConnect',
    authorRole: 'SYSTEM',
    text: `Dispute raised by ${raisedByDisplayName}. A support agent will review this and respond shortly.`,
    internal: false,
  });

  setShowDisputePanel(false);
  if (onDisputeChanged) onDisputeChanged();
};

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

    // rating section
    // -------- CLIENT: leave review on completed bookings --------
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

// -------- Either party: raise a dispute --------
if (canRaiseDispute && !showDisputePanel) {
  actions.push(
    <button
      key="raise-dispute"
      type="button"
      className={styles.dangerBtn}
      onClick={() => setShowDisputePanel(true)}
    >
      <FontAwesomeIcon icon={faGavel} />
      Raise dispute
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

	{/* Provider-only: price agreed confirmation */}
        {viewerRole === 'PROVIDER' &&
          request.status === 'price_agreed' &&
          request.finalPrice !== undefined && (
           <div className={styles.agreedBanner}>
             <FontAwesomeIcon icon={faHandshake} />
           <div>
        <strong>Client accepted your price</strong>
        <span>
          {formatPrice(request.finalPrice)} agreed. You're ready to start
          the work session.
        </span>
      </div>
    </div>
  )}

       {/* Client-only: price agreed confirmation */}
       {viewerRole === 'CLIENT' &&
         request.status === 'price_agreed' &&
          request.finalPrice !== undefined && (
           <div className={styles.agreedBanner}>
             <FontAwesomeIcon icon={faHandshake} />
           <div>
           <strong>Price agreed</strong>
           <span>
          {request.providerDisplayName} will begin the work and clock in on
          the agreed date.
        </span>
      </div>
    </div>
  )}

  {/* Provider-only: client disputed the price */}
{viewerRole === 'PROVIDER' &&
  request.status === 'price_disputed' && (
    <div className={styles.disputeInfoBanner}>
      <FontAwesomeIcon icon={faGavel} />
      <div>
        <strong>Client disputed the price</strong>
        <span>
          Our support team will review this. You'll be contacted
          shortly.
        </span>
      </div>
    </div>
  )}

  {/* Client-only: dispute acknowledged */}
{viewerRole === 'CLIENT' &&
  request.status === 'price_disputed' && (
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

  {/* Dispute banner (both parties + support see this) */}
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
        Dispute {existingDispute.status === 'open' || existingDispute.status === 'awaiting_info' ? 'in progress' : 'resolved'}
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
{showDisputePanel && (
  <RaiseDisputePanel
    againstName={
      viewerRole === 'CLIENT'
        ? request.providerDisplayName
        : request.clientDisplayName
    }
    serviceTitle={request.serviceTitle}
    onSubmit={handleRaiseDispute}
    onCancel={() => setShowDisputePanel(false)}
  />
)}

  {/* Existing review (all roles can see it) */}
{existingReview && (
  <div className={styles.reviewCard}>
    <div className={styles.reviewHeader}>
      <span className={styles.reviewStars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <FontAwesomeIcon
            key={n}
            icon={faStar}
            className={n <= existingReview.rating ? styles.starOn : styles.starOff}
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
          <span key={t} className={styles.reviewTag}>{t}</span>
        ))}
      </div>
    )}
    {existingReview.providerReply ? (
      <div className={styles.providerReply}>
        <strong>Provider reply</strong>
        <p>{existingReview.providerReply.text}</p>
      </div>
    ) : (
      viewerRole === 'PROVIDER' && !reviewReplyOpen && (
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

{/* Leave review panel (client only) */}
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
