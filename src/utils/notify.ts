// src/utils/notify.ts
//
// Pure notification factories. Each function returns a Notification object
// ready to be dispatched via `useNotifications().add(...)`.

import type { Booking, Notification } from '../types';
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

// Provider proposes a final price → client
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

// Client counters → provider
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

// Provider accepts the client counter → client
// (Client's counter was written to booking.finalPrice, so we read it back.)
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

// Provider holds firm after a counter → client
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
