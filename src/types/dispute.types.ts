// src/types/dispute.types.ts

// ============================================
// DISPUTE
// ============================================
//
// A dispute is raised by either party on an active or completed booking.
// Support (Employee / Admin) reviews it via a shared thread, may leave
// internal notes only staff can see, and eventually resolves it.
//
// One dispute can be open per booking at a time. Once resolved, a new one
// could theoretically be raised, but the UI prevents it in the demo.

export type DisputeCategory =
  | 'price'
  | 'quality'
  | 'no_show'
  | 'damage'
  | 'communication'
  | 'other';

export type DisputeStatus =
  | 'open'
  | 'awaiting_info'
  | 'resolved'
  | 'closed';

export type DisputeResolution =
  | 'favours_client'
  | 'favours_provider'
  | 'mutual_agreement'
  | 'no_action';

export type DisputeAuthorRole =
  | 'CLIENT'
  | 'PROVIDER'
  | 'EMPLOYEE'
  | 'ADMIN'
  | 'SYSTEM';

// ============================================
// MESSAGE
// ============================================
//
// A message in the dispute thread. `internal: true` means it's only visible
// to support staff (Employee / Admin) — not to the client or provider.

export interface DisputeMessage {
  id: string;
  authorId: string;
  authorDisplayName: string;
  authorRole: DisputeAuthorRole;
  text: string;
  internal: boolean;
  createdAt: string;
}

// ============================================
// DISPUTE
// ============================================

export interface Dispute {
  id: string;
  bookingId: string;
  requestRef: string;

  // who raised it
  raisedByUserId: string;
  raisedByRole: 'CLIENT' | 'PROVIDER';
  raisedByDisplayName: string;

  // against whom
  againstUserId: string;
  againstRole: 'CLIENT' | 'PROVIDER';
  againstDisplayName: string;

  // what it's about
  category: DisputeCategory;
  reason: string;
  photos?: string[];

  // status
  status: DisputeStatus;

  // shared + internal messages
  messages: DisputeMessage[];

  // resolution
  resolution?: DisputeResolution;
  /** The booking status support chose as the outcome */
  finalBookingStatus?: string;
  resolutionNote?: string;
  resolvedByUserId?: string;
  resolvedByDisplayName?: string;
  resolvedAt?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================
// FORM PAYLOAD
// ============================================

export interface RaiseDisputeFormData {
  category: DisputeCategory;
  reason: string;
  photos?: string[];
}

// ============================================
// CATEGORY LABELS (for UI)
// ============================================

export const DISPUTE_CATEGORY_LABELS: Record<DisputeCategory, string> = {
  price: 'Price disagreement',
  quality: 'Work quality',
  no_show: 'No-show or delay',
  damage: 'Damage or loss',
  communication: 'Communication issue',
  other: 'Something else',
};

export const DISPUTE_RESOLUTION_LABELS: Record<DisputeResolution, string> = {
  favours_client: 'Resolved — favours client',
  favours_provider: 'Resolved — favours provider',
  mutual_agreement: 'Resolved — mutual agreement',
  no_action: 'Closed — no action taken',
};
