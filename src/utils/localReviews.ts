// src/utils/localReviews.ts
//
// localStorage-backed review store.
// One review per booking. Once submitted, cannot be edited.
// Provider may add a single reply.

import type { Review, ProviderRatingSummary } from '../types';

const STORAGE_KEY = 'serviceconnect-reviews';

// ============================================
// READ
// ============================================

export const getLocalReviews = (): Review[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Review[]) : [];
  } catch (err) {
    console.error('Failed to read reviews:', err);
    return [];
  }
};

// ============================================
// WRITE
// ============================================

const writeAll = (list: Review[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to write reviews:', err);
  }
};

export const addLocalReview = (review: Review): void => {
  const current = getLocalReviews();
  writeAll([review, ...current]);
};

// ============================================
// PROVIDER REPLY
// ============================================

export const setProviderReply = (
  reviewId: string,
  text: string
): void => {
  const current = getLocalReviews();
  const next = current.map((r) =>
    r.id === reviewId && !r.providerReply
      ? { ...r, providerReply: { text, createdAt: new Date().toISOString() } }
      : r
  );
  writeAll(next);
};

// ============================================
// AGGREGATE
// ============================================

export const summarizeReviews = (reviews: Review[]): ProviderRatingSummary => {
  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  let sum = 0;
  let recommends = 0;

  for (const r of reviews) {
    const bucket = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
    if (bucket >= 1 && bucket <= 5) {
      breakdown[bucket] += 1;
    }
    sum += r.rating;
    if (r.wouldRecommend) recommends += 1;
  }

  const count = reviews.length;

  return {
    average: count > 0 ? Number((sum / count).toFixed(2)) : null,
    count,
    breakdown,
    recommendRate:
      count > 0 ? Number(((recommends / count) * 100).toFixed(0)) : null,
  };
};

// ============================================
// CLEAR (dev only)
// ============================================

export const clearLocalReviews = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear reviews:', err);
  }
};
