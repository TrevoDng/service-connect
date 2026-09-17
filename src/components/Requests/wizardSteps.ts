// src/components/Requests/wizardSteps.ts
//
// Configuration layer for the guided flow. Each booking status + viewer role
// maps to a single step config: title, body, actions.
//
// No UI, no side effects — RequestCard renders from this and dispatches
// the action keys back to its own handlers.

import type { Booking } from '../../types';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faClock,
  faInbox,
  faFileInvoiceDollar,
  faMapMarkedAlt,
  faPlay,
  faClipboardList,
  faDollarSign,
  faHandshake,
  faCheckCircle,
  faHardHat,
} from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '../../utils/formatters';

// ============================================
// TYPES
// ============================================

export type WizardActionVariant = 'primary' | 'secondary' | 'danger';

export interface WizardAction {
  /** Dispatched back to RequestCard's action handler */
  key: string;
  label: string;
  variant: WizardActionVariant;
}

export interface WizardStepConfig {
  icon: IconDefinition;
  title: string;
  body: string;
  /** Passive step = nothing for the viewer to do, just waiting */
  passive: boolean;
  primaryAction?: WizardAction;
  secondaryAction?: WizardAction;
}

// ============================================
// MILESTONES (unified across roles)
// ============================================

export const MILESTONES = [
  { key: 'requested', label: 'Request' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'consultation', label: 'Consultation' },
  { key: 'price', label: 'Price' },
  { key: 'work', label: 'Work' },
  { key: 'complete', label: 'Complete' },
] as const;

export const MILESTONE_COUNT = MILESTONES.length;

/**
 * Returns which milestone the booking is currently sitting at, and which
 * milestones are already complete.
 *
 * Indices: 0 = Request · 1 = Accepted · 2 = Consultation · 3 = Price
 *          4 = Work    · 5 = Complete
 */
export const getMilestoneState = (
  status: Booking['status']
): { current: number; completed: number[] } => {
  switch (status) {
    case 'requested':
      return { current: 0, completed: [] };
    case 'accepted':
      return { current: 1, completed: [0] };
    case 'consultation_paid':
      return { current: 2, completed: [0, 1] };
    case 'evaluated':
      return { current: 3, completed: [0, 1, 2] };
    case 'price_proposed':
      return { current: 3, completed: [0, 1, 2] };
    case 'price_agreed':
      return { current: 4, completed: [0, 1, 2, 3] };
    case 'in_progress':
      return { current: 4, completed: [0, 1, 2, 3] };
    case 'completed':
      return { current: 5, completed: [0, 1, 2, 3, 4] };
    default:
      return { current: 0, completed: [] };
  }
};

// ============================================
// STEP CONFIG
// ============================================

export const getWizardStep = (
  booking: Booking,
  viewerRole: 'CLIENT' | 'PROVIDER'
): WizardStepConfig => {
  const isClient = viewerRole === 'CLIENT';
  const otherName = isClient
    ? booking.providerDisplayName
    : booking.clientDisplayName;
  const shortName = otherName.split(' ')[0];

  switch (booking.status) {
    // -----------------------------------------
    // REQUESTED
    // -----------------------------------------
    case 'requested':
      return isClient
        ? {
            icon: faClock,
            title: 'Waiting for response',
            body: `${shortName} has been notified about your request for ${booking.serviceTitle}. You'll be able to pay the consultation fee once they accept.`,
            passive: true,
          }
        : {
            icon: faInbox,
            title: 'New request received',
            body: `${otherName} sent you a request for ${booking.serviceTitle}. Review the details and respond.`,
            passive: false,
            primaryAction: { key: 'accept', label: 'Accept', variant: 'primary' },
            secondaryAction: { key: 'decline', label: 'Decline', variant: 'danger' },
          };

    // -----------------------------------------
    // ACCEPTED
    // -----------------------------------------
    case 'accepted':
      return isClient
        ? {
            icon: faFileInvoiceDollar,
            title: 'Pay consultation fee',
            body: `${shortName} accepted your request. Pay ${formatPrice(booking.consultationFee)} to schedule the site visit.`,
            passive: false,
            primaryAction: {
              key: 'pay',
              label: `Pay ${formatPrice(booking.consultationFee)}`,
              variant: 'primary',
            },
          }
        : {
            icon: faClock,
            title: 'Waiting for consultation fee',
            body: `${shortName} will pay ${formatPrice(booking.consultationFee)} to schedule your site visit.`,
            passive: true,
          };

    // -----------------------------------------
    // CONSULTATION PAID
    // -----------------------------------------
    case 'consultation_paid':
      return isClient
        ? {
            icon: faMapMarkedAlt,
            title: 'Consultation scheduled',
            body: `Payment received. ${shortName} will visit your site and upload findings.`,
            passive: true,
          }
        : {
            icon: faPlay,
            title: 'Start the consultation',
            body: `Clock in when you arrive on site, upload photos and findings, then submit.`,
            passive: false,
            primaryAction: {
              key: 'start-consultation',
              label: 'Start consultation',
              variant: 'primary',
            },
          };

    // -----------------------------------------
    // EVALUATED
    // -----------------------------------------
    case 'evaluated':
      return isClient
        ? {
            icon: faClipboardList,
            title: 'Reviewing findings',
            body: `${shortName} has visited the site. You'll receive a final price soon.`,
            passive: true,
          }
        : {
            icon: faDollarSign,
            title: 'Send the final price',
            body: `You've completed the consultation. Send ${otherName} your final price.`,
            passive: false,
            primaryAction: {
              key: 'propose-price',
              label: 'Propose final price',
              variant: 'primary',
            },
          };

    // -----------------------------------------
    // PRICE PROPOSED (negotiation)
    // -----------------------------------------
    case 'price_proposed': {
      const turn = booking.pendingCounterParty;
      const heldFirm = booking.holdFirm === true;

      if (isClient) {
        if (heldFirm) {
          return {
            icon: faHandshake,
            title: 'Provider held firm',
            body: `${shortName} is holding on ${formatPrice(
              booking.finalPrice ?? 0
            )}. Accept their original price or escalate to support.`,
            passive: false,
            primaryAction: {
              key: 'accept-price',
              label: 'Accept original price',
              variant: 'primary',
            },
            secondaryAction: {
              key: 'dispute-price',
              label: 'Dispute',
              variant: 'danger',
            },
          };
        }
        if (turn === 'CLIENT') {
          return {
            icon: faHandshake,
            title: 'Final price proposed',
            body: `${shortName} proposed ${formatPrice(
              booking.finalPrice ?? 0
            )}. Accept, counter, or dispute.`,
            passive: false,
            primaryAction: {
              key: 'accept-price',
              label: 'Accept price',
              variant: 'primary',
            },
            secondaryAction: {
              key: 'counter-price',
              label: 'Counter',
              variant: 'secondary',
            },
          };
        }
        return {
          icon: faClock,
          title: 'Waiting for provider',
          body: `${shortName} is reviewing your counter.`,
          passive: true,
        };
      }

      // Provider view
      if (turn === 'PROVIDER') {
        return {
          icon: faHandshake,
          title: 'Client countered',
          body: `${shortName} proposed ${formatPrice(
            booking.finalPrice ?? 0
          )}. Accept their counter or hold firm on your original price.`,
          passive: false,
          primaryAction: {
            key: 'accept-counter',
            label: 'Accept counter',
            variant: 'primary',
          },
          secondaryAction: {
            key: 'hold-firm',
            label: 'Hold firm',
            variant: 'secondary',
          },
        };
      }
      return {
        icon: faClock,
        title: 'Waiting for client',
        body: `You proposed ${formatPrice(
          booking.finalPrice ?? 0
        )}. Awaiting ${shortName}'s response.`,
        passive: true,
      };
    }

    // -----------------------------------------
    // PRICE AGREED
    // -----------------------------------------
    case 'price_agreed':
      return isClient
        ? {
            icon: faCheckCircle,
            title: 'Ready to begin',
            body: `Price agreed at ${formatPrice(
              booking.finalPrice ?? 0
            )}. ${shortName} will start the work soon.`,
            passive: true,
          }
        : {
            icon: faPlay,
            title: 'Start the work',
            body: `Price agreed at ${formatPrice(
              booking.finalPrice ?? 0
            )}. Open the work session when you're ready to begin.`,
            passive: false,
            primaryAction: {
              key: 'view-work-session',
              label: 'Open work session',
              variant: 'primary',
            },
          };

    // -----------------------------------------
    // IN PROGRESS
    // -----------------------------------------
    case 'in_progress':
      return isClient
        ? {
            icon: faHardHat,
            title: 'Work in progress',
            body: `${shortName} is working on your job. Open the work session to see live photos and updates.`,
            passive: false,
            primaryAction: {
              key: 'view-work-session',
              label: 'View updates',
              variant: 'primary',
            },
          }
        : {
            icon: faHardHat,
            title: 'Work in progress',
            body: `Continue clocking in, uploading progress stages, and completing the job.`,
            passive: false,
            primaryAction: {
              key: 'view-work-session',
              label: 'Open work session',
              variant: 'primary',
            },
          };

    // -----------------------------------------
    // FALLBACK
    // -----------------------------------------
    default:
      return {
        icon: faClock,
        title: 'Loading',
        body: '',
        passive: true,
      };
  }
};
