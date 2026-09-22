// src/types/workSession.types.ts


// ============================================
// STEP EVENTS (Step 13.6)
// ============================================
//
// Not every step is a hard gate. Some are recommended; some are soft. Each
// "soft" step gets a StepEvent that records what actually happened — whether
// the client confirmed, the provider proceeded anyway, or it was skipped.

export type StepStatus =
  | 'confirmed'
  | 'confirmed_late' 
  | 'auto_proceeded'
  | 'skipped'
  | 'contested'
  | 'pending';


export interface StepEvent {
  status: StepStatus;
  attemptedAt?: string;
  resolvedAt?: string;
  resolvedByUserId?: string;
  resolvedByDisplayName?: string;
  note?: string;
}


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
  currentReferenceCode?: string; 
  referenceCodeExpiresAt?: string;
  clockEvents: ClockEvent[];
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

  // ============================================
// WORK GATE (Step 13.3)
// ============================================
//
// Before clocking in for the first time, the provider must share a
// reference code with the client at the gate. The client confirms, and
// only then does clock-in unlock.

arrivedAt?: string;
gateConfirmedByClient?: boolean;
gateConfirmedAt?: string;
gateEvent?: StepEvent;
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
