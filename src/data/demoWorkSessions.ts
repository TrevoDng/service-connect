// src/data/demoWorkSessions.ts
import type { WorkSession } from '../types';

// ============================================
// DEMO WORK SESSIONS
// ============================================
//
// Backs the bookings that have a `workSessionId`:
//   ws-001 → booking b-007 (in-progress bathroom renovation)
//   ws-002 → booking b-008 (completed fence installation)
//
// Timestamps are ISO strings. Photo URLs use placeholder.co so nothing
// breaks if the network is offline — they fall back gracefully.
//
// The in-progress session demonstrates:
//   - multiple days worked (3 clock-in/clock-out pairs)
//   - 3 progress stages, each 1–5 photos
//   - a currently-active reference code that hasn't been invalidated yet

export const demoWorkSessions: WorkSession[] = [
  // ------------------------------------------
  // ws-001 — Bathroom renovation (IN PROGRESS)
  // ------------------------------------------
  {
    id: 'ws-001',
    bookingId: 'b-007',
    providerId: 'p-007',
    clientId: 'c-007',

    // Active code — will be invalidated on next clock-out
    currentReferenceCode: 'SC-4821-KD',
    referenceCodeExpiresAt: '2026-09-12T07:30:00.000Z',

    // Three days worked so far. Each `in` has a code, each `out` doesn't.
    clockEvents: [
      {
        id: 'ce-001',
        type: 'in',
        at: '2026-09-10T07:05:00.000Z',
        referenceCode: 'SC-1122-AB',
        confirmedByClient: true,
      },
      {
        id: 'ce-002',
        type: 'out',
        at: '2026-09-10T16:40:00.000Z',
        confirmedByClient: false,
      },
      {
        id: 'ce-003',
        type: 'in',
        at: '2026-09-11T07:10:00.000Z',
        referenceCode: 'SC-7734-XQ',
        confirmedByClient: true,
      },
      {
        id: 'ce-004',
        type: 'out',
        at: '2026-09-11T17:15:00.000Z',
        confirmedByClient: false,
      },
      {
        id: 'ce-005',
        type: 'in',
        at: '2026-09-12T07:02:00.000Z',
        referenceCode: 'SC-4821-KD',
        confirmedByClient: true,
      },
    ],

    daysWorked: 3,
    totalHours: 28.7,

    // Before photos (1–5) — captured on day 1
    beforePhotos: [
      {
        id: 'wp-001',
        url: 'https://placehold.co/600x400?text=Bathroom+Before+1',
        caption: 'Old tiles before removal',
        uploadedAt: '2026-09-10T07:30:00.000Z',
        uploadedBy: 'p-007',
      },
      {
        id: 'wp-002',
        url: 'https://placehold.co/600x400?text=Bathroom+Before+2',
        caption: 'Old shower base',
        uploadedAt: '2026-09-10T07:31:00.000Z',
        uploadedBy: 'p-007',
      },
      {
        id: 'wp-003',
        url: 'https://placehold.co/600x400?text=Bathroom+Before+3',
        caption: 'Basin area',
        uploadedAt: '2026-09-10T07:32:00.000Z',
        uploadedBy: 'p-007',
      },
    ],

    // Progress stages — unlimited, each 1–5 photos
    progressStages: [
      {
        id: 'ps-001',
        label: 'Day 1 — tile removal & plumbing prep',
        date: '2026-09-10T16:35:00.000Z',
        photos: [
          {
            id: 'wp-010',
            url: 'https://placehold.co/600x400?text=Day+1+Tiles+Off',
            caption: 'Old tiles removed',
            uploadedAt: '2026-09-10T16:30:00.000Z',
            uploadedBy: 'p-007',
          },
          {
            id: 'wp-011',
            url: 'https://placehold.co/600x400?text=Day+1+Plumbing',
            caption: 'Plumbing prepped for new shower',
            uploadedAt: '2026-09-10T16:32:00.000Z',
            uploadedBy: 'p-007',
          },
        ],
      },
      {
        id: 'ps-002',
        label: 'Day 2 — waterproofing & new shower base',
        date: '2026-09-11T17:10:00.000Z',
        photos: [
          {
            id: 'wp-020',
            url: 'https://placehold.co/600x400?text=Day+2+Waterproof',
            caption: 'Waterproofing layer applied',
            uploadedAt: '2026-09-11T17:00:00.000Z',
            uploadedBy: 'p-007',
          },
          {
            id: 'wp-021',
            url: 'https://placehold.co/600x400?text=Day+2+Shower+Base',
            caption: 'New shower base fitted',
            uploadedAt: '2026-09-11T17:05:00.000Z',
            uploadedBy: 'p-007',
          },
          {
            id: 'wp-022',
            url: 'https://placehold.co/600x400?text=Day+2+Pipes',
            caption: 'Pipe work in place',
            uploadedAt: '2026-09-11T17:08:00.000Z',
            uploadedBy: 'p-007',
          },
        ],
      },
      {
        id: 'ps-003',
        label: 'Day 3 — tiling begins',
        date: '2026-09-12T12:00:00.000Z',
        photos: [
          {
            id: 'wp-030',
            url: 'https://placehold.co/600x400?text=Day+3+Tiling+1',
            caption: 'First wall tiled',
            uploadedAt: '2026-09-12T11:45:00.000Z',
            uploadedBy: 'p-007',
          },
          {
            id: 'wp-031',
            url: 'https://placehold.co/600x400?text=Day+3+Tiling+2',
            caption: 'Floor tiles laid',
            uploadedAt: '2026-09-12T11:55:00.000Z',
            uploadedBy: 'p-007',
          },
        ],
      },
    ],

    // Final photos — empty until the job is completed
    finalPhotos: [],

    status: 'in_progress',
    createdAt: '2026-09-10T07:00:00.000Z',
    updatedAt: '2026-09-12T12:00:00.000Z',
  },

  // ------------------------------------------
  // ws-002 — Fence installation (COMPLETED)
  // ------------------------------------------
  {
    id: 'ws-002',
    bookingId: 'b-008',
    providerId: 'p-008',
    clientId: 'c-008',

    // Session is closed, so no active code
    currentReferenceCode: undefined,
    referenceCodeExpiresAt: undefined,

    clockEvents: [
      {
        id: 'ce-100',
        type: 'in',
        at: '2026-09-01T08:00:00.000Z',
        referenceCode: 'SC-2201-PL',
        confirmedByClient: true,
      },
      {
        id: 'ce-101',
        type: 'out',
        at: '2026-09-01T17:00:00.000Z',
        confirmedByClient: false,
      },
      {
        id: 'ce-102',
        type: 'in',
        at: '2026-09-02T08:05:00.000Z',
        referenceCode: 'SC-8890-RT',
        confirmedByClient: true,
      },
      {
        id: 'ce-103',
        type: 'out',
        at: '2026-09-02T16:50:00.000Z',
        confirmedByClient: false,
      },
      {
        id: 'ce-104',
        type: 'in',
        at: '2026-09-03T08:00:00.000Z',
        referenceCode: 'SC-3312-MN',
        confirmedByClient: true,
      },
      {
        id: 'ce-105',
        type: 'out',
        at: '2026-09-03T17:00:00.000Z',
        confirmedByClient: false,
      },
      {
        id: 'ce-106',
        type: 'in',
        at: '2026-09-05T08:00:00.000Z',
        referenceCode: 'SC-6677-KB',
        confirmedByClient: true,
      },
      {
        id: 'ce-107',
        type: 'out',
        at: '2026-09-05T15:30:00.000Z',
        confirmedByClient: false,
      },
    ],

    daysWorked: 4,
    totalHours: 34.5,

    beforePhotos: [
      {
        id: 'wp-100',
        url: 'https://placehold.co/600x400?text=Fence+Before+1',
        caption: 'Empty front yard before work',
        uploadedAt: '2026-09-01T08:15:00.000Z',
        uploadedBy: 'p-008',
      },
      {
        id: 'wp-101',
        url: 'https://placehold.co/600x400?text=Fence+Before+2',
        caption: 'Ground marked for posts',
        uploadedAt: '2026-09-01T08:20:00.000Z',
        uploadedBy: 'p-008',
      },
    ],

    progressStages: [
      {
        id: 'ps-100',
        label: 'Day 1–2 — post holes & concrete',
        date: '2026-09-02T16:45:00.000Z',
        photos: [
          {
            id: 'wp-110',
            url: 'https://placehold.co/600x400?text=Post+Holes',
            caption: 'Post holes dug',
            uploadedAt: '2026-09-01T13:00:00.000Z',
            uploadedBy: 'p-008',
          },
          {
            id: 'wp-111',
            url: 'https://placehold.co/600x400?text=Posts+Set',
            caption: 'Posts set in concrete',
            uploadedAt: '2026-09-02T16:30:00.000Z',
            uploadedBy: 'p-008',
          },
        ],
      },
      {
        id: 'ps-101',
        label: 'Day 3 — palisade panels installed',
        date: '2026-09-03T16:50:00.000Z',
        photos: [
          {
            id: 'wp-120',
            url: 'https://placehold.co/600x400?text=Panels+Half',
            caption: 'First half of the fence up',
            uploadedAt: '2026-09-03T12:00:00.000Z',
            uploadedBy: 'p-008',
          },
          {
            id: 'wp-121',
            url: 'https://placehold.co/600x400?text=Panels+Full',
            caption: 'Panels completed',
            uploadedAt: '2026-09-03T16:40:00.000Z',
            uploadedBy: 'p-008',
          },
        ],
      },
    ],

    finalPhotos: [
      {
        id: 'wp-200',
        url: 'https://placehold.co/600x400?text=Fence+Final+1',
        caption: 'Completed fence — front view',
        uploadedAt: '2026-09-05T15:25:00.000Z',
        uploadedBy: 'p-008',
      },
      {
        id: 'wp-201',
        url: 'https://placehold.co/600x400?text=Fence+Final+2',
        caption: 'Completed fence — side gate',
        uploadedAt: '2026-09-05T15:28:00.000Z',
        uploadedBy: 'p-008',
      },
      {
        id: 'wp-202',
        url: 'https://placehold.co/600x400?text=Fence+Final+3',
        caption: 'Client-approved finish',
        uploadedAt: '2026-09-05T15:30:00.000Z',
        uploadedBy: 'p-008',
      },
    ],

    status: 'completed',
    createdAt: '2026-09-01T07:55:00.000Z',
    updatedAt: '2026-09-05T15:30:00.000Z',
    completedAt: '2026-09-05T15:30:00.000Z',
  },
];

// ============================================
// HELPERS
// ============================================

export const getWorkSessionById = (id: string): WorkSession | undefined =>
  demoWorkSessions.find((ws) => ws.id === id);

export const getWorkSessionByBooking = (
  bookingId: string
): WorkSession | undefined =>
  demoWorkSessions.find((ws) => ws.bookingId === bookingId);

// ============================================
// APPENDED FOR STEP 4 — John Doe ↔ Tom Brown
// ============================================
//
// ws-003 → active session for b-011 (bathroom taps)
//          Currently: clocked in on day 1, waiting for the client to
//          confirm at the gate (status: arrived), with an active code.
//
// ws-004 → completed session for b-012 (kitchen sink)
//          Multi-day job, full before/progress/final photo set.

demoWorkSessions.push(
  {
    id: 'ws-003',
    bookingId: 'b-011',
    providerId: 'p-001',
    clientId: 'c-001',

    // Active code — 30 min from "now" in the demo narrative
    currentReferenceCode: 'SC-2713-BQ',
    referenceCodeExpiresAt: '2026-09-12T07:35:00.000Z',

    clockEvents: [
      {
        id: 'ce-200',
        type: 'in',
        at: '2026-09-12T07:05:00.000Z',
        referenceCode: 'SC-2713-BQ',
        confirmedByClient: false, // waiting for the client to confirm
      },
    ],

    daysWorked: 0,
    totalHours: 0,

    beforePhotos: [
      {
        id: 'wp-300',
        url: 'https://placehold.co/600x400?text=Tap+Before+1',
        caption: 'Old tap — corroded base',
        uploadedAt: '2026-09-12T07:10:00.000Z',
        uploadedBy: 'p-001',
      },
      {
        id: 'wp-301',
        url: 'https://placehold.co/600x400?text=Tap+Before+2',
        caption: 'Basin area before work',
        uploadedAt: '2026-09-12T07:11:00.000Z',
        uploadedBy: 'p-001',
      },
    ],

    progressStages: [],
    finalPhotos: [],

    status: 'arrived',
    createdAt: '2026-09-12T07:00:00.000Z',
    updatedAt: '2026-09-12T07:05:00.000Z',
  },
  {
    id: 'ws-004',
    bookingId: 'b-012',
    providerId: 'p-001',
    clientId: 'c-001',

    currentReferenceCode: undefined,
    referenceCodeExpiresAt: undefined,

    clockEvents: [
      {
        id: 'ce-210',
        type: 'in',
        at: '2026-09-02T09:05:00.000Z',
        referenceCode: 'SC-5500-XY',
        confirmedByClient: true,
      },
      {
        id: 'ce-211',
        type: 'out',
        at: '2026-09-02T16:30:00.000Z',
        confirmedByClient: false,
      },
    ],

    daysWorked: 1,
    totalHours: 7.4,

    beforePhotos: [
      {
        id: 'wp-310',
        url: 'https://placehold.co/600x400?text=Sink+Before',
        caption: 'Leaking drain under the sink',
        uploadedAt: '2026-09-02T09:15:00.000Z',
        uploadedBy: 'p-001',
      },
    ],

    progressStages: [
      {
        id: 'ps-300',
        label: 'Mid-job — seal replaced',
        date: '2026-09-02T13:00:00.000Z',
        photos: [
          {
            id: 'wp-311',
            url: 'https://placehold.co/600x400?text=Seal+Replaced',
            caption: 'New seal in place',
            uploadedAt: '2026-09-02T13:00:00.000Z',
            uploadedBy: 'p-001',
          },
        ],
      },
    ],

    finalPhotos: [
      {
        id: 'wp-320',
        url: 'https://placehold.co/600x400?text=Sink+Final+1',
        caption: 'No leaks after testing',
        uploadedAt: '2026-09-02T16:25:00.000Z',
        uploadedBy: 'p-001',
      },
      {
        id: 'wp-321',
        url: 'https://placehold.co/600x400?text=Sink+Final+2',
        caption: 'Taps running clean',
        uploadedAt: '2026-09-02T16:28:00.000Z',
        uploadedBy: 'p-001',
      },
    ],

    status: 'completed',
    createdAt: '2026-09-02T09:00:00.000Z',
    updatedAt: '2026-09-02T16:30:00.000Z',
    completedAt: '2026-09-02T16:30:00.000Z',
  }
);
