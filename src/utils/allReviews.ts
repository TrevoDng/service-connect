// src/utils/allReviews.ts
//
// Merged reads for reviews. Currently reads only from localStorage.
// When the backend is ready, merge it in here.

import type { Review, ProviderRatingSummary } from '../types';
import { getLocalReviews, summarizeReviews } from './localReviews';

// ============================================
// READS
// ============================================

export const getAllReviews = (): Review[] => {
  return getLocalReviews().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getReviewForBooking = (bookingId: string): Review | undefined =>
  getLocalReviews().find((r) => r.bookingId === bookingId);

export const getReviewsForProvider = (providerId: string): Review[] =>
  getAllReviews().filter((r) => r.providerId === providerId);

export const getReviewsByClient = (clientId: string): Review[] =>
  getAllReviews().filter((r) => r.clientId === clientId);

// ============================================
// SUMMARY
// ============================================

export const getProviderRatingSummary = (
  providerId: string
): ProviderRatingSummary => summarizeReviews(getReviewsForProvider(providerId));
