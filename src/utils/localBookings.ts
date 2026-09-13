// src/utils/localBookings.ts
//
// Local persistence layer for bookings created during the demo.
// When the backend is ready, replace the internals of these functions
// with API calls — the public API stays identical.

import type { Booking } from '../types';

const STORAGE_KEY = 'serviceconnect-user-bookings';

// ============================================
// READ
// ============================================

export const getLocalBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Booking[];
  } catch (err) {
    console.error('Failed to read local bookings:', err);
    return [];
  }
};

// ============================================
// WRITE
// ============================================

const writeAll = (bookings: Booking[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (err) {
    console.error('Failed to write local bookings:', err);
  }
};

export const addLocalBooking = (booking: Booking): void => {
  const current = getLocalBookings();
  writeAll([...current, booking]);
};

export const updateLocalBooking = (
  id: string,
  patch: Partial<Booking>
): void => {
  const current = getLocalBookings();
  const next = current.map((b) =>
    b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b
  );
  writeAll(next);
};

export const removeLocalBooking = (id: string): void => {
  const current = getLocalBookings();
  writeAll(current.filter((b) => b.id !== id));
};

export const clearLocalBookings = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear local bookings:', err);
  }
};
