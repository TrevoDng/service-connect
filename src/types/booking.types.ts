// src/types/booking.types.ts

// ============================================
// BOOKING STATUS FLOW
// ============================================

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'consultation_paid'
  | 'evaluated'
  | 'price_proposed'
  | 'price_agreed'
  | 'in_progress'
  | 'completed'
  | 'declined'
  | 'cancelled'
  | 'price_disputed';

// ============================================
// PRICE STAGES
// ============================================

export type PriceStage =
  | 'suggested'
  | 'consultation'
  | 'final_proposed'
  | 'final_agreed';

export interface PriceHistoryEntry {
  stage: PriceStage;
  amount: number;
  at: string;
  byUserId: string;
  note?: string;
}

// ============================================
// CLIENT PRIVACY CONTROLS
// ============================================

export interface ClientSharedFields {
  displayName: boolean;
  phone: boolean;
  address: boolean;
  gateCode: boolean;
  specialInstructions: boolean;
}

// ============================================
// BOOKING
// ============================================

export interface Booking {
  id: string;
  requestRef: string;

  // parties
  clientId: string;
  clientDisplayName: string;
  providerId: string;
  providerDisplayName: string;

  // service info
  serviceTitle: string;
  serviceCategory: string;
  description: string;
  requestPhotos: string[];

  // scheduling
  requestedDate: string;
  createdAt: string;
  updatedAt: string;

  // status
  status: BookingStatus;
  declineReason?: string;

  // pricing
  suggestedPrice: number;
  consultationFee: number;
  consultationPaidAt?: string;
  finalPrice?: number;
  priceHistory: PriceHistoryEntry[];

  // negotiation state (Step 7h)
  /** Whose turn it is during price negotiation. Undefined = no negotiation in progress. */
  pendingCounterParty?: 'CLIENT' | 'PROVIDER';
  /** Provider holds firm on the original amount after a client counter. */
  holdFirm?: boolean;

  // consultation findings
  siteVisited: boolean;
  consultationPhotos?: string[];
  consultationNotes?: string;

  // privacy
  clientSharedFields: ClientSharedFields;

  // work session (once clock-in has happened)
  workSessionId?: string;

  // ============================================
  // CONSULTATION VISIT TRACKING (Step 7g)
  // ============================================

  /** ISO timestamp of when the provider clocked in for the consultation visit */
  consultationClockIn?: string;
  /** ISO timestamp of when the provider clocked out */
  consultationClockOut?: string;
  /** Active reference code shown for gate confirmation */
  consultationReferenceCode?: string;
  /** ISO timestamp of when the reference code expires */
  consultationReferenceExpiresAt?: string;
  /** Whether the client confirmed the visit at the gate */
  consultationClockConfirmedByClient?: boolean;
}
