// src/utils/allBookings.ts
//
// Single source of truth for reading bookings anywhere in the app.
// Merges:
//   1. Bookings created at runtime (localStorage)
//   2. Overrides applied at runtime (localStorage)
//   3. Static demo seed data
//
// When the backend is ready, replace the bodies with API calls.

import type { Booking } from '../types';
import { demoBookings } from '../data/demoBookings';
import { getLocalBookings } from './localBookings';
import { applyBookingOverrides } from './localBookingOverrides';

// ============================================
// READ
// ============================================

export const getAllBookings = (): Booking[] => {
  const merged = [...getLocalBookings(), ...demoBookings];
  return applyBookingOverrides(merged);
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
// FILTERS
// ============================================

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
