// src/types/review.types.ts

// ============================================
// REVIEW
// ============================================
//
// One review per completed booking. Once submitted, the client cannot edit it.
// The provider may leave a single public reply.
//

export interface ProviderReply {
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;

  // parties
  clientId: string;
  clientDisplayName: string;
  providerId: string;
  providerDisplayName: string;

  // content
  rating: number;               // 1–5
  comment?: string;
  photos?: string[];
  tags?: string[];
  wouldRecommend: boolean;

  createdAt: string;

  // provider's one-time reply
  providerReply?: ProviderReply;
}

// ============================================
// AGGREGATE
// ============================================

export interface ProviderRatingSummary {
  /** Average rating, or null if no reviews yet */
  average: number | null;
  /** Total number of reviews */
  count: number;
  /** Breakdown: how many of each star value */
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  /** Percentage of reviews where wouldRecommend === true */
  recommendRate: number | null;
}

// ============================================
// FORM PAYLOAD
// ============================================

export interface ReviewFormData {
  rating: number;
  comment?: string;
  photos?: string[];
  tags?: string[];
  wouldRecommend: boolean;
}
