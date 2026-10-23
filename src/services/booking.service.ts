// src/services/booking.service.ts
//
// Phase 1 of the bookings migration. Only the requested → accepted/declined
// flow is wired to the backend. Price negotiation, consultation tracking,
// work sessions, and dispute flow still live in localStorage via
// localBookingOverrides.ts.

import { api } from './api.service';
import type { Booking } from '../types';
import {
  getBookingsForProvider as getLocalProviderBookings,
  getBookingsForClient as getLocalClientBookings,
  getBookingById as getLocalBookingById,
} from '../utils/allBookings';
import { setBookingOverride } from '../utils/localBookingOverrides';
import { addLocalBooking } from '../utils/localBookings';

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
};

export default bookingService;