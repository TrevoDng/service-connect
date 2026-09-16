// src/types/index.ts
export * from './booking.types';
export * from './workSession.types';
export * from './chat.types';
export * from './notification.types';
// Note: user.types and service.types are NOT re-exported here because they
// are imported directly in their respective areas (account/, services/).
// If you want them here too, add:
// export * from './user.types';
// export * from './service.types';

// ============================================
// SHARED VIEWER ROLE
// ============================================
//
// Used by any component that adapts its rendering to the current viewer's
// role (chat, request cards, consultation, work sessions, outcomes).
// Centralised here so we don't redefine it in every component.

export type ViewerRole = 'CLIENT' | 'PROVIDER' | 'EMPLOYEE' | 'ADMIN';

// Convenience: which viewer roles are "internal" (support/admin)?
export const isInternalRole = (role: ViewerRole): boolean =>
  role === 'EMPLOYEE' || role === 'ADMIN';

// Convenience: which viewer roles can perform a given action?
export const canAcceptRequest = (role: ViewerRole): boolean =>
  role === 'PROVIDER';
export const canPayConsultation = (role: ViewerRole): boolean =>
  role === 'CLIENT';
export const canProposePrice = (role: ViewerRole): boolean =>
  role === 'PROVIDER';
export const canRespondToPrice = (role: ViewerRole): boolean =>
  role === 'CLIENT';
export const canSeeConsultationFeeStatus = (role: ViewerRole): boolean =>
  role === 'CLIENT';

// Reviews
export * from './review.types';

// Disputes
export * from './dispute.types';
