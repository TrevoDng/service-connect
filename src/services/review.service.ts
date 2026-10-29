// src/services/review.service.ts
import { api } from './api.service';
import type { Review, ProviderRatingSummary, ReviewFormData } from '../types';

export const reviewService = {
  /** Client submits a review for a completed booking */
  submitReview: async (
    bookingId: string,
    formData: ReviewFormData
  ): Promise<Review> => {
    const { review } = await api.post<{ review: Review }>('/reviews', {
      bookingId,
      rating: formData.rating,
      comment: formData.comment,
      photos: formData.photos,
      tags: formData.tags,
      wouldRecommend: formData.wouldRecommend,
    });
    return review;
  },

  /** Get the review for a specific booking (null if none) */
  getReviewForBooking: async (bookingId: string): Promise<Review | null> => {
    const result = await api.get<{ review: Review | null }>(
      `/reviews/booking/${bookingId}`
    );
    return result.review;
  },

  /** Public — get reviews + summary for a provider */
  getReviewsForProvider: async (
    providerId: string
  ): Promise<{ reviews: Review[]; summary: ProviderRatingSummary }> => {
    return api.get<{ reviews: Review[]; summary: ProviderRatingSummary }>(
      `/reviews/provider/${providerId}`
    );
  },

  /** Provider replies to a review (one-time) */
  replyToReview: async (reviewId: string, text: string): Promise<Review> => {
    const { review } = await api.post<{ review: Review }>(
      `/reviews/${reviewId}/reply`,
      { text }
    );
    return review;
  },

  /** My reviews — client or provider view */
  getMyReviews: async (): Promise<Review[]> => {
    const { reviews } = await api.get<{ reviews: Review[] }>('/reviews/my');
    return reviews;
  },
};