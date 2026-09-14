// src/utils/localBookingOverrides.ts
//
// Per-booking override layer for the demo.
// Accept/decline on the provider side, price changes, etc. are written here
// and merged on read. When the backend is ready, remove this file and let
// the server be the source of truth.

import type { Booking } from '../types';

const STORAGE_KEY = 'serviceconnect-booking-overrides';

type OverrideMap = Record<string, Partial<Booking>>;

// ============================================
// READ
// ============================================

export const getBookingOverrides = (): OverrideMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? (parsed as OverrideMap) : {};
  } catch (err) {
    console.error('Failed to read booking overrides:', err);
    return {};
  }
};

// ============================================
// WRITE
// ============================================

const writeAll = (map: OverrideMap) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to write booking overrides:', err);
  }
};

export const setBookingOverride = (
  bookingId: string,
  patch: Partial<Booking>
): void => {
  const current = getBookingOverrides();
  const existing = current[bookingId] ?? {};
  writeAll({
    ...current,
    [bookingId]: {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    },
  });
};

export const clearBookingOverride = (bookingId: string): void => {
  const current = getBookingOverrides();
  delete current[bookingId];
  writeAll(current);
};

export const clearAllOverrides = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear booking overrides:', err);
  }
};

// ============================================
// MERGE
// ============================================

// Apply overrides on top of a list of bookings.
export const applyBookingOverrides = (bookings: Booking[]): Booking[] => {
  const overrides = getBookingOverrides();
  return bookings.map((b) => {
    const patch = overrides[b.id];
    return patch ? { ...b, ...patch } : b;
  });
};
