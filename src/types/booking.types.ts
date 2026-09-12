// src/types/booking.types.ts

// ============================================
// BOOKING STATUS FLOW
// ============================================
//
// requested         → client sent a request with a suggested price
// accepted          → provider agreed to evaluate the job
// consultation_paid → client paid the consultation fee
// evaluated         → provider/employee visited the site and uploaded photos
// price_proposed    → final price has been proposed
// price_agreed      → both sides agreed on the final price
// in_progress       → work has started (clock-in flow active)
// completed         → work is finished and confirmed
//
// declined          → provider declined the request
// cancelled         → client cancelled before work started
// price_disputed    → negotiation failed; admin intervention needed
//
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
  | 'suggested'      // client's suggestion — not binding
  | 'consultation'   // paid by client after provider accepts
  | 'final_proposed' // provider's final price after evaluation
  | 'final_agreed';  // both sides agreed

export interface PriceHistoryEntry {
  stage: PriceStage;
  amount: number;
  at: string;               // ISO timestamp
  byUserId: string;         // who set it
  note?: string;
}

// ============================================
// CLIENT PRIVACY CONTROLS
// ============================================
//
// By default, a client's personal details are hidden from the provider.
// The client can opt to share specific fields with a single provider.
//
export interface ClientSharedFields {
  displayName: boolean;         // always true — visible in chat and request
  phone: boolean;
  address: boolean;
  gateCode: boolean;
  specialInstructions: boolean;
}

// ============================================
// BOOKING
// ============================================

export interface Booking {
  id: string;                     // internal ID
  requestRef: string;             // human reference, e.g. REQ-2026-0001

  // parties
  clientId: string;
  clientDisplayName: string;      // always available
  providerId: string;
  providerDisplayName: string;

  // service info
  serviceTitle: string;
  serviceCategory: string;
  description: string;
  requestPhotos: string[];        // client-uploaded photos at request time (URLs)

  // scheduling
  requestedDate: string;          // ISO timestamp the client asked for
  createdAt: string;
  updatedAt: string;

  // status
  status: BookingStatus;
  declineReason?: string;         // if status === 'declined'

  // pricing
  suggestedPrice: number;         // client's initial suggestion (ZAR)
  consultationFee: number;        // set when status reaches 'accepted'
  consultationPaidAt?: string;
  finalPrice?: number;            // set when status reaches 'price_proposed'
  priceHistory: PriceHistoryEntry[];

  // consultation
  siteVisited: boolean;           // did the provider physically visit?
  consultationPhotos?: string[];  // provider-uploaded site photos (URLs)
  consultationNotes?: string;

  // privacy
  clientSharedFields: ClientSharedFields;

  // work session (present once clock-in has happened)
  workSessionId?: string;
}
