// src/utils/notify.ts
//
// Pure notification factories. Each function returns a Notification object
// ready to be dispatched via `useNotifications().add(...)`.
//
// They are intentionally side-effect free: no context, no storage, no
// dispatching. The caller decides where the notification goes. This keeps
// copy + icons + link targets consistent across the whole lifecycle, and
// makes future backend wiring trivial (one place to swap).
//
// Naming: notify<Event>(booking, ...extras) → Notification for the RECIPIENT
// The `actor` is always the party who performed the action.

import type { Booking, Notification } from '../types';
import { generateId } from './referenceCode';
import { formatPrice } from './formatters';

// ============================================
// SHARED HELPERS
// ============================================

const nowIso = () => new Date().toISOString();

// ============================================
// 3A — CLIENT PAYS CONSULTATION → PROVIDER NOTIFIED
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
// 3B — PROVIDER STARTS CONSULTATION (arrives, generates code)
//      → CLIENT NOTIFIED WITH THE CODE
// ============================================
//
// `workSessionId` is passed explicitly because the booking's own
// workSessionId may not be written yet when this fires — the session was
// just created and the booking override happens on the next line.

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
// 3C — CLIENT CONFIRMS GATE CODE → PROVIDER NOTIFIED
// ============================================

export const notifyGateConfirmed = (booking: Booking): Notification => ({
  id: generateId(),
  userId: booking.providerId,
  type: 'clock_confirmed',
  priority: 'normal',
  title: 'Client confirmed at the gate',
  message: `${booking.clientDisplayName} confirmed your arrival for ${booking.serviceTitle}. You can proceed.`,
  linkTo: '/provider/dashboard?tab=requests',
  actorId: booking.clientId,
  actorDisplayName: booking.clientDisplayName,
  bookingId: booking.id,
  workSessionId: booking.workSessionId,
  createdAt: nowIso(),
});

// ============================================
// 3D — PROVIDER COMPLETES CONSULTATION → CLIENT NOTIFIED
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
// 3E — CLIENT ACCEPTS FINAL PRICE → PROVIDER NOTIFIED
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
// 3F — PROVIDER BEGINS THE JOB → CLIENT NOTIFIED
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
