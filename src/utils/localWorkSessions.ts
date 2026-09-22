// src/utils/localWorkSessions.ts
//
// localStorage-backed work session store. Mirrors the API the backend will
// expose when wired. Demo seed data in demoWorkSessions.ts is unchanged;
// this file stores sessions created at runtime.

import type { WorkSession, StepEvent } from '../types';

const STORAGE_KEY = 'serviceconnect-work-sessions';

// ============================================
// READ
// ============================================

export const getLocalWorkSessions = (): WorkSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkSession[]) : [];
  } catch (err) {
    console.error('Failed to read local work sessions:', err);
    return [];
  }
};

export const getLocalWorkSessionById = (id: string): WorkSession | undefined =>
  getLocalWorkSessions().find((s) => s.id === id);

export const getLocalWorkSessionByBooking = (
  bookingId: string
): WorkSession | undefined =>
  getLocalWorkSessions().find((s) => s.bookingId === bookingId);

// ============================================
// WRITE
// ============================================

const writeAll = (list: WorkSession[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to write local work sessions:', err);
  }
};

export const addLocalWorkSession = (session: WorkSession): void => {
  const current = getLocalWorkSessions();
  writeAll([session, ...current]);
};

export const updateLocalWorkSession = (
  id: string,
  patch: Partial<WorkSession>
): void => {
  const current = getLocalWorkSessions();
  const next = current.map((s) =>
    s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
  );
  writeAll(next);
};

export const clearLocalWorkSessions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear local work sessions:', err);
  }
};

// ============================================
// STEP EVENTS (Step 13.6)
// ============================================

// import type { StepEvent } from '../types';

/**
 * Merge a partial StepEvent into a session's gateEvent field.
 * Used by the "Proceed anyway" flow and the client's retroactive confirm.
 */
export const updateGateEvent = (
  sessionId: string,
  patch: Partial<StepEvent>
): void => {
  const current = getLocalWorkSessions();
  const next = current.map((s) => {
    if (s.id !== sessionId) return s;
    const existing: StepEvent = s.gateEvent ?? { status: 'pending' };
    return {
      ...s,
      gateEvent: { ...existing, ...patch },
      updatedAt: new Date().toISOString(),
    };
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.error('Failed to update gate event:', err);
  }
};
