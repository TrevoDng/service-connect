// src/types/workSession.types.ts

// ============================================
// WORK SESSION STATUS
// ============================================

export type WorkSessionStatus =
  | 'arrived'       // provider clocked in, code sent to client
  | 'confirmed'     // client confirmed the code at the gate
  | 'in_progress'   // provider is working (may span multiple days)
  | 'completed';    // provider clocked out for the last time and uploaded final photos

// ============================================
// PHOTO
// ============================================

export interface WorkPhoto {
  id: string;
  url: string;            // blob URL, data URL, or remote URL later
  caption?: string;
  uploadedAt: string;     // ISO
  uploadedBy: string;     // user ID
}

// ============================================
// PROGRESS STAGES
// ============================================
//
// Provider flow:
//   - before        : 1–5 photos, one-shot, captured on day 1
//   - progressStages: unlimited stages, each with a label, date, and 1–5 photos
//   - final         : 1–5 photos, locks the session
//
export interface ProgressStage {
  id: string;
  label: string;          // e.g. "Day 2 — pipes installed"
  date: string;           // ISO timestamp
  photos: WorkPhoto[];    // 1–5
}

// ============================================
// CLOCK EVENTS
// ============================================
//
// Each physical arrival/departure is a clock event. Days that span multiple
// clock-ins are represented as multiple entries in `clockEvents`.
//
export type ClockEventType = 'in' | 'out';

export interface ClockEvent {
  id: string;
  type: ClockEventType;
  at: string;             // ISO timestamp
  referenceCode?: string; // only on 'in' events — the SC-XXXX-XX code
  confirmedByClient: boolean;
}

// ============================================
// WORK SESSION
// ============================================

export interface WorkSession {
  id: string;
  bookingId: string;
  providerId: string;
  clientId: string;

  // Security
  currentReferenceCode?: string;   // active code (invalidated on clock-out)
  referenceCodeExpiresAt?: string; // ISO timestamp — 30 min validity

  // Clock tracking (multiple days allowed)
  clockEvents: ClockEvent[];

  // Day-level summary derived from clockEvents
  daysWorked: number;
  totalHours: number;

  // Photos
  beforePhotos: WorkPhoto[];       // 1–5
  progressStages: ProgressStage[]; // unlimited
  finalPhotos: WorkPhoto[];        // 1–5

  // Session status
  status: WorkSessionStatus;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ============================================
// HELPERS (type-level only — logic lives in utils)
// ============================================

export interface CreateClockInPayload {
  bookingId: string;
  providerId: string;
  clientId: string;
}

export interface CreateProgressStagePayload {
  workSessionId: string;
  label: string;
  photos: File[];
}
