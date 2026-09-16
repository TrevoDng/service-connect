// src/utils/allDisputes.ts
//
// Merged reads for disputes. Currently reads from localStorage.
// When the backend is wired, merge it in here.

import type { Dispute, DisputeStatus } from '../types';
import { getLocalDisputes } from './localDisputes';

// ============================================
// READS
// ============================================

export const getAllDisputes = (): Dispute[] =>
  getLocalDisputes().sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

export const getDisputeById = (id: string): Dispute | undefined =>
  getLocalDisputes().find((d) => d.id === id);

export const getDisputeByBooking = (bookingId: string): Dispute | undefined =>
  getLocalDisputes().find((d) => d.bookingId === bookingId);

export const getDisputesByStatus = (status: DisputeStatus): Dispute[] =>
  getAllDisputes().filter((d) => d.status === status);

/** Disputes that still need support attention */
export const getOpenDisputes = (): Dispute[] =>
  getAllDisputes().filter((d) => d.status === 'open' || d.status === 'awaiting_info');

/** All disputes raised by a user */
export const getDisputesRaisedBy = (userId: string): Dispute[] =>
  getAllDisputes().filter((d) => d.raisedByUserId === userId);

/** All disputes involving a user (raised by or against) */
export const getDisputesForUser = (userId: string): Dispute[] =>
  getAllDisputes().filter(
    (d) => d.raisedByUserId === userId || d.againstUserId === userId
  );

/** Convenience: how many open disputes total (for sidebar badge) */
export const getOpenDisputeCount = (): number => getOpenDisputes().length;
