// src/utils/notify.ts
//
// Pure notification factories. Each function returns a Notification object
// ready to be dispatched via `useNotifications().add(...)`.

import type { Booking, Notification, Dispute, Review } from '../types';
import { DISPUTE_CATEGORY_LABELS } from '../types';
import { generateId } from './referenceCode';
import { formatPrice } from './formatters';

const nowIso = () => new Date().toISOString();

// ============================================
// 3A — CLIENT PAYS CONSULTATION → PROVIDER
// ============================================

export const notifyConsultationPaid = (
  booking: Booking
): Notification => ({
  id: generateId(),
  userId: booking.providerId,
  type: 'consultation_paid',
  priority: 'high',
  title: 'Consultation fee received',
  message: `${booking.clientDisplayName} paid the ${formatPrice(
    booking.consultationFee
  )} consultation fee for ${booking.serviceTitle}. You can now schedule the site visit.`,
  linkTo: '/provider/dashboard?tab=requests',
  actorId: booking.clientId,
  actorDisplayName: booking.clientDisplayName,
  bookingId: booking.id,
  createdAt: nowIso(),
});

// ============================================
// 3B — PROVIDER STARTS CONSULTATION → CLIENT
// ============================================

export const notifyConsultationStarted = (
  booking: Booking,
  referenceCode: string,
  workSessionId?: string
): Notification => ({
  id: generateId(),
  userId: booking.clientId,
  type: 'clock_in',
  priority: 'high',
  title: 'Provider at your gate',
  message: `${booking.providerDisplayName} has arrived for the ${booking.serviceTitle} consultation. Reference code: ${referenceCode}. Confirm only if it matches.`,
  linkTo: '/client/dashboard?tab=requests',
  actorId: booking.providerId,
  actorDisplayName: booking.providerDisplayName,
  bookingId: booking.id,
  workSessionId: workSessionId ?? booking.workSessionId,
  createdAt: nowIso(),
});

// ============================================
// 3C — CLIENT CONFIRMS GATE CODE → PROVIDER
// ============================================

export const notifyGateConfirmed = (
  booking: Booking,
  retroactive = false
): Notification => ({
  id: generateId(),
  userId: booking.providerId,
  type: 'clock_confirmed',
  priority: retroactive ? 'normal' : 'high',
  title: retroactive
    ? 'Client approved retroactively'
    : 'Client confirmed at the gate',
  message: retroactive
    ? `${booking.clientDisplayName} confirmed your arrival at ${booking.serviceTitle} after the fact. You're cleared to continue.`
    : `${booking.clientDisplayName} confirmed your arrival for ${booking.serviceTitle}. You can proceed.`,
  linkTo: '/provider/dashboard?tab=requests',
  actorId: booking.clientId,
  actorDisplayName: booking.clientDisplayName,
  bookingId: booking.id,
  workSessionId: booking.workSessionId,
  createdAt: nowIso(),
});

export const notifyGateDenied = (booking: Booking): Notification => ({
  id: generateId(),
  userId: booking.providerId,
  type: 'clock_confirmed',
  priority: 'high',
  title: 'Client did not confirm your code',
  message: `${booking.clientDisplayName} did not recognise your reference code for ${booking.serviceTitle}. Do not proceed without contacting them.`,
  linkTo: '/provider/dashboard?tab=requests',
  actorId: booking.clientId,
  actorDisplayName: booking.clientDisplayName,
  bookingId: booking.id,
  workSessionId: booking.workSessionId,
  createdAt: nowIso(),
});

// ============================================
// 3D — PROVIDER COMPLETES CONSULTATION → CLIENT
// ============================================

export const notifyConsultationCompleted = (
  booking: Booking
): Notification => ({
  id: generateId(),
  userId: booking.clientId,
  type: 'consultation_completed',
  priority: 'normal',
  title: 'Consultation complete',
  message: `${booking.providerDisplayName} finished the site visit for ${booking.serviceTitle}. Photos and findings are ready for you to review.`,
  linkTo: '/client/dashboard?tab=requests',
  actorId: booking.providerId,
  actorDisplayName: booking.providerDisplayName,
  bookingId: booking.id,
  workSessionId: booking.workSessionId,
  createdAt: nowIso(),
});

// ============================================
// PRICE NEGOTIATION CHAIN
// ============================================

export const notifyPriceProposed = (
  booking: Booking,
  amount: number
): Notification => ({
  id: generateId(),
  userId: booking.clientId,
  type: 'price_proposed',
  priority: 'high',
  title: 'Final price proposed',
  message: `${booking.providerDisplayName} proposed a final price of ${formatPrice(
    amount
  )} for ${booking.serviceTitle}. Review and respond.`,
  linkTo: '/client/dashboard?tab=requests',
  actorId: booking.providerId,
  actorDisplayName: booking.providerDisplayName,
  bookingId: booking.id,
  createdAt: nowIso(),
});

export const notifyPriceCountered = (
  booking: Booking,
  amount: number
): Notification => ({
  id: generateId(),
  userId: booking.providerId,
  type: 'price_proposed',
  priority: 'high',
  title: 'Client countered your price',
  message: `${booking.clientDisplayName} countered with ${formatPrice(
    amount
  )} for ${booking.serviceTitle}. Accept their counter or hold firm.`,
  linkTo: '/provider/dashboard?tab=requests',
  actorId: booking.clientId,
  actorDisplayName: booking.clientDisplayName,
  bookingId: booking.id,
  createdAt: nowIso(),
});

export const notifyCounterAccepted = (booking: Booking): Notification => ({
  id: generateId(),
  userId: booking.clientId,
  type: 'price_agreed',
  priority: 'high',
  title: 'Your counter was accepted',
  message: `${booking.providerDisplayName} accepted your counter of ${formatPrice(
    booking.finalPrice ?? 0
  )} for ${booking.serviceTitle}. They'll start soon.`,
  linkTo: '/client/dashboard?tab=requests',
  actorId: booking.providerId,
  actorDisplayName: booking.providerDisplayName,
  bookingId: booking.id,
  createdAt: nowIso(),
});

export const notifyHoldFirm = (booking: Booking): Notification => ({
  id: generateId(),
  userId: booking.clientId,
  type: 'price_proposed',
  priority: 'high',
  title: 'Provider held firm on their price',
  message: `${booking.providerDisplayName} kept their original price for ${booking.serviceTitle}. Accept it or escalate to support.`,
  linkTo: '/client/dashboard?tab=requests',
  actorId: booking.providerId,
  actorDisplayName: booking.providerDisplayName,
  bookingId: booking.id,
  createdAt: nowIso(),
});

// ============================================
// 3E — CLIENT ACCEPTS FINAL PRICE → PROVIDER
// ============================================

export const notifyPriceAccepted = (booking: Booking): Notification => ({
  id: generateId(),
  userId: booking.providerId,
  type: 'price_agreed',
  priority: 'high',
  title: 'Price agreed',
  message: `${booking.clientDisplayName} accepted your final price of ${formatPrice(
    booking.finalPrice ?? booking.suggestedPrice
  )} for ${booking.serviceTitle}. You can start the job.`,
  linkTo: '/provider/dashboard?tab=requests',
  actorId: booking.clientId,
  actorDisplayName: booking.clientDisplayName,
  bookingId: booking.id,
  createdAt: nowIso(),
});

// ============================================
// 3F — PROVIDER BEGINS THE JOB → CLIENT
// ============================================

export const notifyWorkStarted = (booking: Booking): Notification => ({
  id: generateId(),
  userId: booking.clientId,
  type: 'clock_in',
  priority: 'normal',
  title: 'Work has started',
  message: `${booking.providerDisplayName} has clocked in and started the ${booking.serviceTitle} job.`,
  linkTo: '/client/dashboard?tab=requests',
  actorId: booking.providerId,
  actorDisplayName: booking.providerDisplayName,
  bookingId: booking.id,
  workSessionId: booking.workSessionId,
  createdAt: nowIso(),
});

// ============================================
// DISPUTES — EITHER PARTY → COUNTERPARTY
// ============================================
//
// The recipient is whoever the dispute was raised against.
// The actor is whoever raised it. Direction is derived from the
// dispute record itself, so the same helper works both ways.

export const notifyDisputeRaised = (
  booking: Booking,
  dispute: Dispute
): Notification => {
  const categoryLabel = DISPUTE_CATEGORY_LABELS[dispute.category];
  const raiserLabel = dispute.raisedByRole === 'CLIENT' ? 'Client' : 'Provider';

  return {
    id: generateId(),
    userId: dispute.againstUserId,
    type: 'dispute_raised',
    priority: 'high',
    title: `${raiserLabel} raised a dispute`,
    message: `${dispute.raisedByDisplayName} raised a dispute about ${categoryLabel.toLowerCase()} on ${booking.serviceTitle}. Support will review and coordinate.`,
    linkTo:
      dispute.againstRole === 'CLIENT'
        ? '/client/dashboard?tab=support'
        : '/provider/dashboard?tab=support',
    actorId: dispute.raisedByUserId,
    actorDisplayName: dispute.raisedByDisplayName,
    bookingId: booking.id,
    createdAt: nowIso(),
  };
};

  // ============================================
// DISPUTE THREAD REPLIES
// ============================================
//
// Returns 0, 1, or 2 notifications depending on who replied:
//   - A party replies → notify the other party (1)
//   - Staff replies   → notify BOTH parties (2)
//
// Uses `addMany` at the call site so a single call can fan out.

export const notifyDisputeReply = (
  booking: Booking,
  dispute: Dispute,
  replier: {
    userId: string;
    displayName: string;
    role: 'CLIENT' | 'PROVIDER' | 'EMPLOYEE' | 'ADMIN';
  },
  messageText: string
): Notification[] => {
  const now = nowIso();
  const snippet =
    messageText.length > 90
      ? messageText.slice(0, 87).trimEnd() + '…'
      : messageText;

  const isStaff = replier.role === 'EMPLOYEE' || replier.role === 'ADMIN';

  const build = (
    recipientUserId: string,
    recipientRole: 'CLIENT' | 'PROVIDER'
  ): Notification => ({
    id: generateId(),
    userId: recipientUserId,
    type: 'dispute_message',
    priority: isStaff ? 'high' : 'normal',
    title: isStaff ? 'Support replied to your dispute' : 'New reply on your dispute',
    message: isStaff
      ? `ServiceConnect support replied on the dispute for ${booking.serviceTitle}: "${snippet}"`
      : `${replier.displayName} replied on the dispute for ${booking.serviceTitle}: "${snippet}"`,
    linkTo:
      recipientRole === 'CLIENT'
        ? '/client/dashboard?tab=support'
        : '/provider/dashboard?tab=support',
    actorId: replier.userId,
    actorDisplayName: replier.displayName,
    bookingId: booking.id,
    createdAt: now,
  });

  // Staff → both parties
  if (isStaff) {
    return [
      build(dispute.raisedByUserId, dispute.raisedByRole),
      build(dispute.againstUserId, dispute.againstRole),
    ];
  }

  // A party replied → notify the other party
    // A party replied → notify the other party.
  //
  // We compare by ROLE, not userId: the demo auth IDs (demo-client-1)
  // don't line up with demo data IDs (c-001), so userId comparison
  // silently no-ops. Roles are unique per dispute (one CLIENT, one
  // PROVIDER), so role comparison is reliable.
  if (replier.role === dispute.raisedByRole) {
    return [build(dispute.againstUserId, dispute.againstRole)];
  }
  if (replier.role === dispute.againstRole) {
    return [build(dispute.raisedByUserId, dispute.raisedByRole)];
  }

  // Replier isn't a recognised party — bail silently
  return [];
};

// ============================================
// REVIEWS
// ============================================

export const notifyReviewSubmitted = (
  booking: Booking,
  review: Review
): Notification => {
  const stars = '⭐'.repeat(Math.max(1, Math.min(5, Math.round(review.rating))));
  const snippet = review.comment
    ? review.comment.length > 90
      ? review.comment.slice(0, 87).trimEnd() + '…'
      : review.comment
    : null;

  return {
    id: generateId(),
    userId: booking.providerId,
    type: 'review_submitted',
    priority: 'normal',
    title: `New ${review.rating}-star review ${stars}`,
    message: snippet
      ? `${review.clientDisplayName} reviewed ${booking.serviceTitle}: "${snippet}"`
      : `${review.clientDisplayName} left a ${review.rating}-star review for ${booking.serviceTitle}.`,
    linkTo: '/provider/dashboard?tab=requests',
    actorId: booking.clientId,
    actorDisplayName: booking.clientDisplayName,
    bookingId: booking.id,
    createdAt: nowIso(),
  };
};

export const notifyReviewReplied = (
  booking: Booking,
  review: Review
): Notification => ({
  id: generateId(),
  userId: booking.clientId,
  type: 'review_replied',
  priority: 'normal',
  title: 'Provider replied to your review',
  message: `${booking.providerDisplayName} replied to your review of ${booking.serviceTitle}.`,
  linkTo: '/client/dashboard?tab=history',
  actorId: booking.providerId,
  actorDisplayName: booking.providerDisplayName,
  bookingId: booking.id,
  createdAt: nowIso(),
});
