// src/services/booking.service.ts
import { api } from './api.service';
import type { Booking, ProgressStage, WorkPhoto, WorkSession } from '../types';

export const bookingService = {
  // ==========================================
  // CLIENT
  // ==========================================

  /** Create a new booking (client only) */
  createBooking: async (payload: {
    id?: string;
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
    const res = await api.post<{ booking: Booking }>('/bookings', payload);
    return res.booking;
  },

  /** Get all bookings where the current user is the client */
  getMyBookings: async (_clientId: string): Promise<Booking[]> => {
    const res = await api.get<{ bookings: Booking[] }>('/bookings');
    return res.bookings;
  },
    
  /** Get a single booking by id (client side) */
  getClientBookingById: async (bookingId: string): Promise<Booking | undefined> => {
    const res = await api.get<{ bookings: Booking[] }>('/bookings');
    return res.bookings.find((b) => b.id === bookingId);
  },

  /** Get a single booking by id (provider side) */
  getProviderBookingById: async (bookingId: string): Promise<Booking | undefined> => {
    const res = await api.get<{ booking: Booking }>(`/provider/bookings/${bookingId}`);
    return res.booking;
  },

  /** Clock in to start a consultation (provider only) */
  clockInConsultation: async (
    bookingId: string,
    referenceCode: string,
    expiresAt: string
  ): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(
      `/provider/bookings/${bookingId}/consultation/clock-in`,
      { referenceCode, expiresAt }
    );
    return res.booking;
  },

  /** Clock out of a consultation (provider only) */
  clockOutConsultation: async (bookingId: string): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(
      `/provider/bookings/${bookingId}/consultation/clock-out`
    );
    return res.booking;
  },

  /** Submit consultation findings (provider only) */
  submitConsultation: async (
    bookingId: string,
    notes: string,
    photos: string[]
  ): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(
      `/provider/bookings/${bookingId}/consultation/submit`,
      { notes, photos }
    );
    return res.booking;
  },

  /** Pay the consultation fee (client only) */
  payConsultation: async (bookingId: string): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(`/bookings/${bookingId}/pay-consultation`);
    return res.booking;
  },

  // ==========================================
  // PROVIDER
  // ==========================================

  /** Get all bookings for the current provider */
  getProviderBookings: async (_providerId: string): Promise<Booking[]> => {
    const res = await api.get<{ bookings: Booking[] }>('/provider/bookings');
    return res.bookings;
  },

  complainOnBooking: async (bookingId: string, text: string): Promise<Booking> => {
    const res = await api.post<{ booking: Booking }>(`/bookings/${bookingId}/complain`, { text });
    return res.booking;
  },

  confirmComplete: async (bookingId: string): Promise<Booking> => {
    const res = await api.post<{ booking: Booking }>(`/bookings/${bookingId}/confirm-complete`);
    return res.booking;
  },

  getProviderComplaints: async (): Promise<Booking[]> => {
    const res = await api.get<{ complaints: Booking[] }>('/provider/complaints');
    return res.complaints;
  },

  /** Accept a booking (sets status=accepted + consultationFee) */
  acceptBooking: async (
    bookingId: string,
    consultationFee: number
  ): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(`/provider/bookings/${bookingId}/accept`, {
      consultationFee,
    });
    return res.booking;
  },

  /** Decline a booking (sets status=declined + declineReason) */
  declineBooking: async (
    bookingId: string,
    reason: string
  ): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(`/provider/bookings/${bookingId}/decline`, {
      reason,
    });
    return res.booking;
  },

  proposePrice: async (
    bookingId: string,
    amount: number,
    note: string
  ): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(
      `/provider/bookings/${bookingId}/propose-price`,
      { amount, note }
    );
    return res.booking;
  },

  acceptCounter: async (bookingId: string): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(`/provider/bookings/${bookingId}/accept-counter`);
    return res.booking;
  },

  providerHoldFirm: async (bookingId: string): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(`/provider/bookings/${bookingId}/hold-firm`);
    return res.booking;
  },

  clientHoldFirm: async (bookingId: string): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(`/bookings/${bookingId}/hold-firm`);
    return res.booking;
  },

  acceptFinalPrice: async (bookingId: string): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(`/bookings/${bookingId}/accept-price`);
    return res.booking;
  },

  counterPrice: async (
    bookingId: string,
    amount: number,
    note: string
  ): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(`/bookings/${bookingId}/counter-price`, {
      amount,
      note,
    });
    return res.booking;
  },

  disputePrice: async (
    bookingId: string,
    reason: string
  ): Promise<Booking> => {
    const res = await api.patch<{ booking: Booking }>(`/bookings/${bookingId}/dispute-price`, {
      reason,
    });
    return res.booking;
  },

  // ==========================================
  // WORK SESSIONS
  // ==========================================

  arriveAtSite: async (
    bookingId: string,
    referenceCode: string,
    expiresAt: string
  ): Promise<WorkSession> => {
    const res = await api.post<{ session: WorkSession }>(
      `/provider/bookings/${bookingId}/work-session/arrive`,
      { referenceCode, expiresAt }
    );
    return res.session;
  },

  getProviderWorkSession: async (bookingId: string): Promise<WorkSession | null> => {
    try {
      const res = await api.get<{ session: WorkSession }>(`/provider/bookings/${bookingId}/work-session`);
      return res.session;
    } catch {
      return null;
    }
  },

  getClientWorkSession: async (bookingId: string): Promise<WorkSession | null> => {
    try {
      const res = await api.get<{ session: WorkSession }>(`/bookings/${bookingId}/work-session`);
      return res.session;
    } catch {
      return null;
    }
  },

  confirmGate: async (bookingId: string): Promise<WorkSession> => {
    const res = await api.post<{ session: WorkSession }>(`/bookings/${bookingId}/work-session/confirm-gate`);
    return res.session;
  },

  denyGate: async (bookingId: string): Promise<WorkSession> => {
    const res = await api.post<{ session: WorkSession }>(`/bookings/${bookingId}/work-session/deny-gate`);
    return res.session;
  },

  proceedAnyway: async (bookingId: string, note: string): Promise<WorkSession> => {
    const res = await api.post<{ session: WorkSession }>(
      `/provider/bookings/${bookingId}/work-session/proceed-anyway`,
      { note }
    );
    return res.session;
  },

  retroactiveResponse: async (
    bookingId: string,
    action: 'confirm' | 'dispute'
  ): Promise<WorkSession> => {
    const res = await api.post<{ session: WorkSession }>(
      `/bookings/${bookingId}/work-session/retroactive`,
      { action }
    );
    return res.session;
  },

  clockIn: async (bookingId: string): Promise<WorkSession> => {
    const res = await api.post<{ session: WorkSession }>(`/provider/bookings/${bookingId}/work-session/clock-in`);
    return res.session;
  },

  clockOut: async (bookingId: string): Promise<WorkSession> => {
    const res = await api.post<{ session: WorkSession }>(`/provider/bookings/${bookingId}/work-session/clock-out`);
    return res.session;
  },

  completeSession: async (bookingId: string): Promise<WorkSession> => {
    const res = await api.post<{ session: WorkSession }>(`/provider/bookings/${bookingId}/work-session/complete`);
    return res.session;
  },

  reopenSession: async (bookingId: string): Promise<WorkSession> => {
    const res = await api.post<{ session: WorkSession }>(`/provider/bookings/${bookingId}/work-session/reopen`);
    return res.session;
  },

  setBeforePhotos: async (bookingId: string, photos: WorkPhoto[]): Promise<WorkSession> => {
    const res = await api.put<{ session: WorkSession }>(
      `/provider/bookings/${bookingId}/work-session/before-photos`,
      { photos }
    );
    return res.session;
  },

  deleteBeforePhoto: async (bookingId: string, photoId: string): Promise<WorkSession> => {
    const res = await api.delete<{ session: WorkSession }>(
      `/provider/bookings/${bookingId}/work-session/before-photos/${photoId}`
    );
    return res.session;
  },

  setFinalPhotos: async (bookingId: string, photos: WorkPhoto[]): Promise<WorkSession> => {
    const res = await api.put<{ session: WorkSession }>(
      `/provider/bookings/${bookingId}/work-session/final-photos`,
      { photos }
    );
    return res.session;
  },

  deleteFinalPhoto: async (bookingId: string, photoId: string): Promise<WorkSession> => {
    const res = await api.delete<{ session: WorkSession }>(
      `/provider/bookings/${bookingId}/work-session/final-photos/${photoId}`
    );
    return res.session;
  },

  upsertProgressStage: async (bookingId: string, stage: ProgressStage): Promise<WorkSession> => {
    const res = await api.post<{ session: WorkSession }>(
      `/provider/bookings/${bookingId}/work-session/progress-stages`,
      { stage }
    );
    return res.session;
  },

  deleteProgressStage: async (bookingId: string, stageId: string): Promise<WorkSession> => {
    const res = await api.delete<{ session: WorkSession }>(
      `/provider/bookings/${bookingId}/work-session/progress-stages/${stageId}`
    );
    return res.session;
  },  
};

export default bookingService;