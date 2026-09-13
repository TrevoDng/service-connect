// src/utils/allBookings.ts
//
// Single source of truth for reading bookings anywhere in the app.
// Merges the static demo seed with any bookings created at runtime
// (currently persisted to localStorage).

import type { Booking } from '../types';
import { demoBookings } from '../data/demoBookings';
import { getLocalBookings } from './localBookings';

// ============================================
// READ
// ============================================

export const getAllBookings = (): Booking[] => {
  return [...getLocalBookings(), ...demoBookings];
};

export const getBookingById = (id: string): Booking | undefined => {
  return getAllBookings().find((b) => b.id === id);
};

export const getBookingsForClient = (clientId: string): Booking[] => {
  return getAllBookings()
    .filter((b) => b.clientId === clientId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
};

export const getBookingsForProvider = (providerId: string): Booking[] => {
  return getAllBookings()
    .filter((b) => b.providerId === providerId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
};

// ============================================
// FILTERS USED BY THE REQUESTS VIEWS
// ============================================

// A request is "current" while it hasn't reached a terminal state.
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
