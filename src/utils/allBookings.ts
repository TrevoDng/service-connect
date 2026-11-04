// src/utils/allBookings.ts
import type { Booking } from '../types';

export const isCurrentRequest = (b: Booking): boolean => {
  return (
    b.status === 'requested' ||
    b.status === 'accepted' ||
    b.status === 'consultation_paid' ||
    b.status === 'evaluated' ||
    b.status === 'price_proposed' ||
    b.status === 'price_agreed' ||
    b.status === 'in_progress'
  );
};

export const isClosedRequest = (b: Booking): boolean => {
  return (
    b.status === 'completed' ||
    b.status === 'declined' ||
    b.status === 'cancelled' ||
    b.status === 'price_disputed'
  );
};

export const isEligibleForDispute = (b: Booking): boolean => {
  const blockedStatuses: Booking['status'][] = [
    'requested',
    'cancelled',
  ];
  return !blockedStatuses.includes(b.status);
};