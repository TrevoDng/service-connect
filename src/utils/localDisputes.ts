// src/utils/localDisputes.ts
//
// localStorage-backed dispute store.
// Mirrors the shape the backend will expose when wired up.

import type {
  Dispute,
  DisputeMessage,
  DisputeStatus,
  DisputeResolution,
} from '../types';
import { generateId } from './referenceCode';

const STORAGE_KEY = 'serviceconnect-disputes';

// ============================================
// READ
// ============================================

export const getLocalDisputes = (): Dispute[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Dispute[]) : [];
  } catch (err) {
    console.error('Failed to read disputes:', err);
    return [];
  }
};

// ============================================
// WRITE
// ============================================

const writeAll = (list: Dispute[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to write disputes:', err);
  }
};

export const addLocalDispute = (dispute: Dispute): void => {
  const current = getLocalDisputes();
  writeAll([dispute, ...current]);
};

export const updateLocalDispute = (
  disputeId: string,
  patch: Partial<Dispute>
): void => {
  const current = getLocalDisputes();
  const next = current.map((d) =>
    d.id === disputeId
      ? { ...d, ...patch, updatedAt: new Date().toISOString() }
      : d
  );
  writeAll(next);
};

// ============================================
// MESSAGES
// ============================================

export const addDisputeMessage = (
  disputeId: string,
  message: Omit<DisputeMessage, 'id' | 'createdAt'>
): void => {
  const current = getLocalDisputes();
  const next = current.map((d) =>
    d.id === disputeId
      ? {
          ...d,
          messages: [
            ...d.messages,
            {
              ...message,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        }
      : d
  );
  writeAll(next);
};

// ============================================
// RESOLUTION / STATUS
// ============================================

export const setDisputeStatus = (
  disputeId: string,
  status: DisputeStatus
): void => {
  updateLocalDispute(disputeId, { status });
};

export const resolveDispute = (
  disputeId: string,
  payload: {
    resolution: DisputeResolution;
    resolutionNote: string;
    finalBookingStatus?: string;
    resolvedByUserId: string;
    resolvedByDisplayName: string;
  }
): void => {
  updateLocalDispute(disputeId, {
    status: payload.resolution === 'no_action' ? 'closed' : 'resolved',
    resolution: payload.resolution,
    resolutionNote: payload.resolutionNote,
    finalBookingStatus: payload.finalBookingStatus,
    resolvedByUserId: payload.resolvedByUserId,
    resolvedByDisplayName: payload.resolvedByDisplayName,
    resolvedAt: new Date().toISOString(),
  });
};

// ============================================
// DEV
// ============================================

export const clearLocalDisputes = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear disputes:', err);
  }
};
