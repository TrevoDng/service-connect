// src/services/booking.service.ts
//
// Phase 1 of the bookings migration. Only the requested → accepted/declined
// flow is wired to the backend. Price negotiation, consultation tracking,
// work sessions, and dispute flow still live in localStorage via
// localBookingOverrides.ts.

import { api } from './api.service';
import type { Booking, ProgressStage, WorkPhoto, WorkSession } from '../types';
import {
  getBookingsForProvider as getLocalProviderBookings,
  getBookingsForClient as getLocalClientBookings,
  getBookingById as getLocalBookingById,
} from '../utils/allBookings';
import { setBookingOverride } from '../utils/localBookingOverrides';
import { addLocalBooking } from '../utils/localBookings';
import { getLocalWorkSessionByBooking, updateGateEvent, updateLocalWorkSession } from '../utils/localWorkSessions';

// ============================================================
// FALLBACK WRAPPER
// ============================================================
async function withFallback<T>(
  label: string,
  backendCall: () => Promise<T>,
  fallback: () => T
): Promise<T> {
  try {
    return await backendCall();
  } catch (err) {
    console.warn(
      `[booking.service] Backend unreachable for "${label}". Using demo data.`,
      err instanceof Error ? err.message : err
    );
    return fallback();
  }
}

// ============================================================
// SERVICE
// ============================================================

export const bookingService = {
  // ==========================================
  // CLIENT
  // ==========================================

  /** Create a new booking (client only) */
  createBooking: async (payload: {
    providerId: string;
    providerDisplayName: string;
    serviceTitle: string;
    serviceCategory: string;
    description: string;
    requestPhotos: string[];
    requestedDate: string;
    suggestedPrice: number;
    clientDisplayName?: string;
  }): Promise<Booking> => {
    return withFallback(
      'createBooking',
      () => api.post<{ booking: Booking }>('/bookings', payload).then((r) => r.booking),
      () => {
        // Offline: build a synthetic local booking and store it.
        const now = new Date().toISOString();
        const fakeId = `local-${Date.now()}`;
        const synthetic: Booking = {
          id: fakeId,
          requestRef: `REQ-${new Date().getFullYear()}-OFFLINE`,
          clientId: '',
          clientDisplayName: payload.clientDisplayName || 'You',
          providerId: payload.providerId,
          providerDisplayName: payload.providerDisplayName,
          serviceTitle: payload.serviceTitle,
          serviceCategory: payload.serviceCategory,
          description: payload.description,
          requestPhotos: payload.requestPhotos,
          requestedDate: payload.requestedDate,
          createdAt: now,
          updatedAt: now,
          status: 'requested',
          suggestedPrice: payload.suggestedPrice,
          consultationFee: 0,
          priceHistory: [
            {
              stage: 'suggested',
              amount: payload.suggestedPrice,
              at: now,
              byUserId: '',
              note: 'Client-suggested price — not binding.',
            },
          ],
          siteVisited: false,
          clientSharedFields: {
            displayName: true,
            phone: false,
            address: false,
            gateCode: false,
            specialInstructions: false,
          },
        };
        addLocalBooking(synthetic);
        return synthetic;
      }
    );
  },

  /** Get all bookings where the current user is the client */
  getMyBookings: async (clientId: string): Promise<Booking[]> => {
    return withFallback(
      'getMyBookings',
      () => api.get<{ bookings: Booking[] }>('/bookings').then((r) => r.bookings),
      () => getLocalClientBookings(clientId)
    );
  },
    
    /** Get a single booking by id (client side) */
  getClientBookingById: async (bookingId: string): Promise<Booking | undefined> => {
    return withFallback(
      'getClientBookingById',
      () =>
        api
          .get<{ bookings: Booking[] }>('/bookings')
          .then((r) => r.bookings.find((b) => b.id === bookingId)),
      () => getLocalBookingById(bookingId)
    );
  },

  /** Get a single booking by id (provider side) */
  getProviderBookingById: async (bookingId: string): Promise<Booking | undefined> => {
    return withFallback(
      'getProviderBookingById',
      () =>
        api
          .get<{ booking: Booking }>(`/provider/bookings/${bookingId}`)
          .then((r) => r.booking),
      () => getLocalBookingById(bookingId)
    );
  },

    /** Clock in to start a consultation (provider only) */
  clockInConsultation: async (
    bookingId: string,
    referenceCode: string,
    expiresAt: string
  ): Promise<Booking> => {
    return withFallback(
      'clockInConsultation',
      () =>
        api
          .patch<{ booking: Booking }>(
            `/provider/bookings/${bookingId}/consultation/clock-in`,
            { referenceCode, expiresAt }
          )
          .then((r) => r.booking),
      () => {
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        const now = new Date().toISOString();
        setBookingOverride(bookingId, {
          consultationClockIn: now,
          consultationReferenceCode: referenceCode,
          consultationReferenceExpiresAt: expiresAt,
          updatedAt: now,
        });
        return {
          ...b,
          consultationClockIn: now,
          consultationReferenceCode: referenceCode,
          consultationReferenceExpiresAt: expiresAt,
        };
      }
    );
  },

  /** Clock out of a consultation (provider only) */
  clockOutConsultation: async (bookingId: string): Promise<Booking> => {
    return withFallback(
      'clockOutConsultation',
      () =>
        api
          .patch<{ booking: Booking }>(
            `/provider/bookings/${bookingId}/consultation/clock-out`
          )
          .then((r) => r.booking),
      () => {
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        const now = new Date().toISOString();
        setBookingOverride(bookingId, {
          consultationClockOut: now,
          consultationReferenceCode: undefined,
          consultationReferenceExpiresAt: undefined,
          updatedAt: now,
        });
        return {
          ...b,
          consultationClockOut: now,
          consultationReferenceCode: undefined,
          consultationReferenceExpiresAt: undefined,
        };
      }
    );
  },

  /** Submit consultation findings (provider only) */
  submitConsultation: async (
    bookingId: string,
    notes: string,
    photos: string[]
  ): Promise<Booking> => {
    return withFallback(
      'submitConsultation',
      () =>
        api
          .patch<{ booking: Booking }>(
            `/provider/bookings/${bookingId}/consultation/submit`,
            { notes, photos }
          )
          .then((r) => r.booking),
      () => {
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        const now = new Date().toISOString();
        setBookingOverride(bookingId, {
          status: 'evaluated',
          siteVisited: true,
          consultationNotes: notes,
          consultationPhotos: photos,
          updatedAt: now,
        });
        return {
          ...b,
          status: 'evaluated' as const,
          siteVisited: true,
          consultationNotes: notes,
          consultationPhotos: photos,
        };
      }
    );
  },

    /** Pay the consultation fee (client only) */
  payConsultation: async (bookingId: string): Promise<Booking> => {
    return withFallback(
      'payConsultation',
      () =>
        api
          .patch<{ booking: Booking }>(`/bookings/${bookingId}/pay-consultation`)
          .then((r) => r.booking),
      () => {
        // Offline: mirror the old behaviour using local overrides.
        const paidAt = new Date().toISOString();
        setBookingOverride(bookingId, {
          status: 'consultation_paid',
          consultationPaidAt: paidAt,
          updatedAt: paidAt,
        });
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        return { ...b, status: 'consultation_paid' as const, consultationPaidAt: paidAt };
      }
    );
  },

  // ==========================================
  // PROVIDER
  // ==========================================

  /** Get all bookings for the current provider */
  getProviderBookings: async (providerId: string): Promise<Booking[]> => {
    return withFallback(
      'getProviderBookings',
      () =>
        api
          .get<{ bookings: Booking[] }>('/provider/bookings')
          .then((r) => r.bookings),
      () => getLocalProviderBookings(providerId)
    );
  },

  /** Accept a booking (sets status=accepted + consultationFee) */
  acceptBooking: async (
    bookingId: string,
    consultationFee: number
  ): Promise<Booking> => {
    return withFallback(
      'acceptBooking',
      () =>
        api
          .patch<{ booking: Booking }>(`/provider/bookings/${bookingId}/accept`, {
            consultationFee,
          })
          .then((r) => r.booking),
      () => {
        // Offline: fall back to the existing local override mechanism
        setBookingOverride(bookingId, {
          status: 'accepted',
          consultationFee,
        });
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        return { ...b, status: 'accepted' as const, consultationFee };
      }
    );
  },

  /** Decline a booking (sets status=declined + declineReason) */
  declineBooking: async (
    bookingId: string,
    reason: string
  ): Promise<Booking> => {
    return withFallback(
      'declineBooking',
      () =>
        api
          .patch<{ booking: Booking }>(`/provider/bookings/${bookingId}/decline`, {
            reason,
          })
          .then((r) => r.booking),
      () => {
        setBookingOverride(bookingId, {
          status: 'declined',
          declineReason: reason,
        });
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        return { ...b, status: 'declined' as const, declineReason: reason };
      }
    );
  },

    proposePrice: async (
    bookingId: string,
    amount: number,
    note: string
  ): Promise<Booking> => {
    return withFallback(
      'proposePrice',
      () =>
        api
          .patch<{ booking: Booking }>(
            `/provider/bookings/${bookingId}/propose-price`,
            { amount, note }
          )
          .then((r) => r.booking),
      () => {
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        const now = new Date().toISOString();
        setBookingOverride(bookingId, {
          status: 'price_proposed',
          finalPrice: amount,
          pendingCounterParty: 'CLIENT',
          holdFirm: false,
          priceHistory: [
            ...(b.priceHistory ?? []),
            {
              stage: 'final_proposed',
              amount,
              at: now,
              byUserId: b.providerId,
              note: note || undefined,
            },
          ],
          updatedAt: now,
        });
        return { ...b, status: 'price_proposed' as const, finalPrice: amount };
      }
    );
  },

  acceptCounter: async (bookingId: string): Promise<Booking> => {
    return withFallback(
      'acceptCounter',
      () =>
        api
          .patch<{ booking: Booking }>(
            `/provider/bookings/${bookingId}/accept-counter`
          )
          .then((r) => r.booking),
      () => {
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        setBookingOverride(bookingId, {
          status: 'price_agreed',
          pendingCounterParty: undefined,
          holdFirm: false,
          updatedAt: new Date().toISOString(),
        });
        return { ...b, status: 'price_agreed' as const };
      }
    );
  },

  providerHoldFirm: async (bookingId: string): Promise<Booking> => {
    return withFallback(
      'providerHoldFirm',
      () =>
        api
          .patch<{ booking: Booking }>(
            `/provider/bookings/${bookingId}/hold-firm`
          )
          .then((r) => r.booking),
      () => {
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        setBookingOverride(bookingId, {
          holdFirm: true,
          pendingCounterParty: 'CLIENT',
          updatedAt: new Date().toISOString(),
        });
        return { ...b, holdFirm: true };
      }
    );
  },

    /** Hold firm on the client side (client's last proposal) */
  clientHoldFirm: async (bookingId: string): Promise<Booking> => {
    return withFallback(
      'clientHoldFirm',
      () =>
        api
          .patch<{ booking: Booking }>(`/bookings/${bookingId}/hold-firm`)
          .then((r) => r.booking),
      () => {
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        setBookingOverride(bookingId, {
          holdFirm: true,
          pendingCounterParty: 'PROVIDER',
          updatedAt: new Date().toISOString(),
        });
        return { ...b, holdFirm: true, pendingCounterParty: 'PROVIDER' as const };
      }
    );
  },

    acceptFinalPrice: async (bookingId: string): Promise<Booking> => {
    return withFallback(
      'acceptFinalPrice',
      () =>
        api
          .patch<{ booking: Booking }>(`/bookings/${bookingId}/accept-price`)
          .then((r) => r.booking),
      () => {
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        setBookingOverride(bookingId, {
          status: 'price_agreed',
          pendingCounterParty: undefined,
          holdFirm: false,
          updatedAt: new Date().toISOString(),
        });
        return { ...b, status: 'price_agreed' as const };
      }
    );
  },

  counterPrice: async (
    bookingId: string,
    amount: number,
    note: string
  ): Promise<Booking> => {
    return withFallback(
      'counterPrice',
      () =>
        api
          .patch<{ booking: Booking }>(`/bookings/${bookingId}/counter-price`, {
            amount,
            note,
          })
          .then((r) => r.booking),
      () => {
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        setBookingOverride(bookingId, {
          finalPrice: amount,
          holdFirm: false,
          pendingCounterParty: 'PROVIDER',
          updatedAt: new Date().toISOString(),
        });
        return { ...b, finalPrice: amount, pendingCounterParty: 'PROVIDER' as const };
      }
    );
  },

  disputePrice: async (
    bookingId: string,
    reason: string
  ): Promise<Booking> => {
    // Dispute is available on both client and provider routes — we'll call
    // the client endpoint here; booking.service is shared, so for provider
    // calls add a second wrapper (providerDisputePrice) if needed.
    return withFallback(
      'disputePrice',
      () =>
        api
          .patch<{ booking: Booking }>(`/bookings/${bookingId}/dispute-price`, {
            reason,
          })
          .then((r) => r.booking),
      () => {
        const b = getLocalBookingById(bookingId);
        if (!b) throw new Error('Booking not found in local store');
        setBookingOverride(bookingId, {
          status: 'price_disputed',
          declineReason: reason,
          updatedAt: new Date().toISOString(),
        });
        return { ...b, status: 'price_disputed' as const };
      }
    );
  },

    // ==========================================
  // WORK SESSIONS (Phase 4)
  // ==========================================

  /** Provider arrives on site — creates session with gate code */
  arriveAtSite: async (
    bookingId: string,
    referenceCode: string,
    expiresAt: string
  ): Promise<WorkSession> => {
    return withFallback(
      'arriveAtSite',
      () =>
        api
          .post<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/arrive`,
            { referenceCode, expiresAt }
          )
          .then((r) => r.session),
      () => {
        throw new Error('Cannot arrive offline — please connect to the internet');
      }
    );
  },

  /** Get work session (provider view) */
  getProviderWorkSession: async (
    bookingId: string
  ): Promise<WorkSession | null> => {
    return withFallback(
      'getProviderWorkSession',
      () =>
        api
          .get<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session`
          )
          .then((r) => r.session),
      () => {
        // Offline — look up from local store
        const local = getLocalWorkSessionByBooking(bookingId);
        return local ?? null;
      }
    ).catch(() => null);
  },

  /** Get work session (client view) */
  getClientWorkSession: async (
    bookingId: string
  ): Promise<WorkSession | null> => {
    return withFallback(
      'getClientWorkSession',
      () =>
        api
          .get<{ session: WorkSession }>(
            `/bookings/${bookingId}/work-session`
          )
          .then((r) => r.session),
      () => {
        const local = getLocalWorkSessionByBooking(bookingId);
        return local ?? null;
      }
    ).catch(() => null);
  },

  /** Client confirms gate access */
  confirmGate: async (bookingId: string): Promise<WorkSession> => {
    return withFallback(
      'confirmGate',
      () =>
        api
          .post<{ session: WorkSession }>(
            `/bookings/${bookingId}/work-session/confirm-gate`
          )
          .then((r) => r.session),
      () => {
        const s = getLocalWorkSessionByBooking(bookingId);
        if (!s) throw new Error('Session not found');
        updateLocalWorkSession(s.id, {
          gateConfirmedByClient: true,
          gateConfirmedAt: new Date().toISOString(),
          status: 'confirmed',
        });
        return { ...s, gateConfirmedByClient: true, status: 'confirmed' as const };
      }
    );
  },

  /** Client denies gate access */
  denyGate: async (bookingId: string): Promise<WorkSession> => {
    return withFallback(
      'denyGate',
      () =>
        api
          .post<{ session: WorkSession }>(
            `/bookings/${bookingId}/work-session/deny-gate`
          )
          .then((r) => r.session),
      () => {
        const s = getLocalWorkSessionByBooking(bookingId);
        if (!s) throw new Error('Session not found');
        updateLocalWorkSession(s.id, {
          currentReferenceCode: undefined,
          referenceCodeExpiresAt: undefined,
        });
        return { ...s, currentReferenceCode: undefined };
      }
    );
  },

  /** Provider proceeds without client confirmation */
  proceedAnyway: async (
    bookingId: string,
    note: string
  ): Promise<WorkSession> => {
    return withFallback(
      'proceedAnyway',
      () =>
        api
          .post<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/proceed-anyway`,
            { note }
          )
          .then((r) => r.session),
      () => {
        const s = getLocalWorkSessionByBooking(bookingId);
        if (!s) throw new Error('Session not found');
        updateLocalWorkSession(s.id, { status: 'in_progress' });
        updateGateEvent(s.id, {
          status: 'auto_proceeded',
          resolvedAt: new Date().toISOString(),
          note,
        });
        return { ...s, status: 'in_progress' as const };
      }
    );
  },

  /** Client retroactively confirms or disputes a gate event */
  retroactiveResponse: async (
    bookingId: string,
    action: 'confirm' | 'dispute'
  ): Promise<WorkSession> => {
    return withFallback(
      'retroactiveResponse',
      () =>
        api
          .post<{ session: WorkSession }>(
            `/bookings/${bookingId}/work-session/retroactive`,
            { action }
          )
          .then((r) => r.session),
      () => {
        const s = getLocalWorkSessionByBooking(bookingId);
        if (!s) throw new Error('Session not found');
        if (action === 'confirm') {
          updateLocalWorkSession(s.id, {
            gateConfirmedByClient: true,
            gateConfirmedAt: new Date().toISOString(),
          });
          updateGateEvent(s.id, { status: 'confirmed_late', resolvedAt: new Date().toISOString() });
        } else {
          updateGateEvent(s.id, { status: 'contested', resolvedAt: new Date().toISOString() });
        }
        return s;
      }
    );
  },

  /** Provider clocks in */
  clockIn: async (bookingId: string): Promise<WorkSession> => {
    return withFallback(
      'clockIn',
      () =>
        api
          .post<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/clock-in`
          )
          .then((r) => r.session),
      () => {
        throw new Error('Cannot clock in offline — please connect to the internet');
      }
    );
  },

  /** Provider clocks out */
  clockOut: async (bookingId: string): Promise<WorkSession> => {
    return withFallback(
      'clockOut',
      () =>
        api
          .post<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/clock-out`
          )
          .then((r) => r.session),
      () => {
        throw new Error('Cannot clock out offline — please connect to the internet');
      }
    );
  },

  /** Provider marks session complete */
  completeSession: async (bookingId: string): Promise<WorkSession> => {
    return withFallback(
      'completeSession',
      () =>
        api
          .post<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/complete`
          )
          .then((r) => r.session),
      () => {
        throw new Error('Cannot complete offline — please connect to the internet');
      }
    );
  },

  /** Set full beforePhotos array (PUT — replaces) */
  setBeforePhotos: async (
    bookingId: string,
    photos: WorkPhoto[]
  ): Promise<WorkSession> => {
    return withFallback(
      'setBeforePhotos',
      () =>
        api
          .put<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/before-photos`,
            { photos }
          )
          .then((r) => r.session),
      () => {
        const s = getLocalWorkSessionByBooking(bookingId);
        if (!s) throw new Error('Session not found');
        updateLocalWorkSession(s.id, { beforePhotos: photos });
        return { ...s, beforePhotos: photos };
      }
    );
  },

  /** Delete one before photo */
  deleteBeforePhoto: async (
    bookingId: string,
    photoId: string
  ): Promise<WorkSession> => {
    return withFallback(
      'deleteBeforePhoto',
      () =>
        api
          .delete<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/before-photos/${photoId}`
          )
          .then((r) => r.session),
      () => {
        const s = getLocalWorkSessionByBooking(bookingId);
        if (!s) throw new Error('Session not found');
        const next = s.beforePhotos.filter((p) => p.id !== photoId);
        updateLocalWorkSession(s.id, { beforePhotos: next });
        return { ...s, beforePhotos: next };
      }
    );
  },

  /** Set full finalPhotos array (PUT — replaces) */
  setFinalPhotos: async (
    bookingId: string,
    photos: WorkPhoto[]
  ): Promise<WorkSession> => {
    return withFallback(
      'setFinalPhotos',
      () =>
        api
          .put<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/final-photos`,
            { photos }
          )
          .then((r) => r.session),
      () => {
        const s = getLocalWorkSessionByBooking(bookingId);
        if (!s) throw new Error('Session not found');
        updateLocalWorkSession(s.id, { finalPhotos: photos });
        return { ...s, finalPhotos: photos };
      }
    );
  },

  /** Delete one final photo */
  deleteFinalPhoto: async (
    bookingId: string,
    photoId: string
  ): Promise<WorkSession> => {
    return withFallback(
      'deleteFinalPhoto',
      () =>
        api
          .delete<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/final-photos/${photoId}`
          )
          .then((r) => r.session),
      () => {
        const s = getLocalWorkSessionByBooking(bookingId);
        if (!s) throw new Error('Session not found');
        const next = s.finalPhotos.filter((p) => p.id !== photoId);
        updateLocalWorkSession(s.id, { finalPhotos: next });
        return { ...s, finalPhotos: next };
      }
    );
  },

  /** Upsert progress stage */
  upsertProgressStage: async (
    bookingId: string,
    stage: ProgressStage
  ): Promise<WorkSession> => {
    return withFallback(
      'upsertProgressStage',
      () =>
        api
          .post<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/progress-stages`,
            { stage }
          )
          .then((r) => r.session),
      () => {
        const s = getLocalWorkSessionByBooking(bookingId);
        if (!s) throw new Error('Session not found');
        const existing = s.progressStages.some((st) => st.id === stage.id);
        const next = existing
          ? s.progressStages.map((st) => (st.id === stage.id ? stage : st))
          : [...s.progressStages, stage];
        updateLocalWorkSession(s.id, { progressStages: next });
        return { ...s, progressStages: next };
      }
    );
  },

  /** Delete progress stage */
  deleteProgressStage: async (
    bookingId: string,
    stageId: string
  ): Promise<WorkSession> => {
    return withFallback(
      'deleteProgressStage',
      () =>
        api
          .delete<{ session: WorkSession }>(
            `/provider/bookings/${bookingId}/work-session/progress-stages/${stageId}`
          )
          .then((r) => r.session),
      () => {
        const s = getLocalWorkSessionByBooking(bookingId);
        if (!s) throw new Error('Session not found');
        const next = s.progressStages.filter((st) => st.id !== stageId);
        updateLocalWorkSession(s.id, { progressStages: next });
        return { ...s, progressStages: next };
      }
    );
  },  
};



export default bookingService;