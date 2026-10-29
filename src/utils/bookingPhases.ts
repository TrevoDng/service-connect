// src/utils/bookingPhases.ts
import type { BookingStatus } from '../types';

export type BookingPhase = 'consultation' | 'work' | 'closed';

export const getPhase = (status: BookingStatus): BookingPhase => {
  if (status === 'declined' || status === 'cancelled') return 'closed';
  if (
    status === 'requested' ||
    status === 'accepted' ||
    status === 'consultation_paid' ||
    status === 'evaluated' ||
    status === 'price_proposed' ||
    status === 'price_disputed'
  ) {
    return 'consultation';
  }
  // price_agreed, in_progress, completed
  return 'work';
};