// src/services/dispute.service.ts
import { api } from './api.service';
import type { Dispute, RaiseDisputeFormData } from '../types';

export const disputeService = {
  getMyDisputes: async (): Promise<Dispute[]> => {
    const { disputes } = await api.get<{ disputes: Dispute[] }>('/disputes');
    return disputes;
  },

  getDisputeById: async (id: string): Promise<Dispute> => {
    const { dispute } = await api.get<{ dispute: Dispute }>(`/disputes/${id}`);
    return dispute;
  },

  raiseDispute: async (
    bookingId: string,
    form: RaiseDisputeFormData
  ): Promise<Dispute> => {
    const { dispute } = await api.post<{ dispute: Dispute }>('/disputes', {
      bookingId,
      category: form.category,
      reason: form.reason,
      photos: form.photos,
    });
    return dispute;
  },

  addMessage: async (
    disputeId: string,
    text: string,
    internal: boolean
  ): Promise<void> => {
    await api.post(`/disputes/${disputeId}/messages`, { text, internal });
  },

  requestInfo: async (disputeId: string): Promise<Dispute> => {
    const { dispute } = await api.post<{ dispute: Dispute }>(
      `/disputes/${disputeId}/request-info`
    );
    return dispute;
  },

  resolve: async (
    disputeId: string,
    payload: {
      resolution: string;
      resolutionNote: string;
      finalBookingStatus?: string;
    }
  ): Promise<Dispute> => {
    const { dispute } = await api.patch<{ dispute: Dispute }>(
      `/disputes/${disputeId}/resolve`,
      payload
    );
    return dispute;
  },

    getDisputeByBooking: async (bookingId: string): Promise<Dispute | null> => {
    const result = await api.get<{ dispute: Dispute | null }>(
      `/disputes/booking/${bookingId}`
    );
    return result.dispute;
  },
};