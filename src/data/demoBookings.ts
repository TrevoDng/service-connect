// src/data/demoBookings.ts
import type { Booking } from '../types';
import { buildRequestRef } from '../utils/referenceCode';

// ============================================
// DEMO BOOKINGS
// ============================================
//
// Covers every status so we can render UI variants without a backend.
// Every booking includes the fields the Booking type requires.
//
// IDs are stable strings (not random) so demo data doesn't shuffle across
// re-renders during development.

export const demoBookings: Booking[] = [
  // ------------------------------------------
  // 1. Freshly requested — no provider action yet
  // ------------------------------------------
  {
    id: 'b-001',
    requestRef: buildRequestRef(1, 2026),
    clientId: 'c-001',
    clientDisplayName: 'John Doe',
    providerId: 'p-001',
    providerDisplayName: 'Tom Brown',
    serviceTitle: 'Plumbing Repair',
    serviceCategory: 'Plumbing',
    description:
      'Kitchen sink is leaking from the base. Water pooling under the cabinet. Need urgent attention.',
    requestPhotos: [
      'https://placehold.co/600x400?text=Leak+1',
      'https://placehold.co/600x400?text=Leak+2',
    ],
    requestedDate: '2026-09-14T09:00:00.000Z',
    createdAt: '2026-09-10T14:00:00.000Z',
    updatedAt: '2026-09-10T14:00:00.000Z',
    status: 'requested',
    suggestedPrice: 350,
    consultationFee: 0,
    priceHistory: [
      {
        stage: 'suggested',
        amount: 350,
        at: '2026-09-10T14:00:00.000Z',
        byUserId: 'c-001',
        note: 'Client-suggested amount — not binding.',
      },
    ],
    siteVisited: false,
    clientSharedFields: {
      displayName: true,
      phone: false,
      address: false,
      gateCode: false,
      specialInstructions: false,
    },
  },

  // ------------------------------------------
  // 2. Accepted, consultation not yet paid
  // ------------------------------------------
  {
    id: 'b-002',
    requestRef: buildRequestRef(2, 2026),
    clientId: 'c-002',
    clientDisplayName: 'Jane Smith',
    providerId: 'p-002',
    providerDisplayName: 'Emily Davis',
    serviceTitle: 'Electrical Installation',
    serviceCategory: 'Electrical',
    description: 'Install two new power outlets in the home office.',
    requestPhotos: ['https://placehold.co/600x400?text=Office+Wall'],
    requestedDate: '2026-09-16T08:00:00.000Z',
    createdAt: '2026-09-09T10:00:00.000Z',
    updatedAt: '2026-09-10T08:00:00.000Z',
    status: 'accepted',
    suggestedPrice: 450,
    consultationFee: 150,
    priceHistory: [
      {
        stage: 'suggested',
        amount: 450,
        at: '2026-09-09T10:00:00.000Z',
        byUserId: 'c-002',
      },
    ],
    siteVisited: false,
    clientSharedFields: {
      displayName: true,
      phone: false,
      address: false,
      gateCode: false,
      specialInstructions: false,
    },
  },

  // ------------------------------------------
  // 3. Consultation paid, awaiting site visit
  // ------------------------------------------
  {
    id: 'b-003',
    requestRef: buildRequestRef(3, 2026),
    clientId: 'c-003',
    clientDisplayName: 'Mike Johnson',
    providerId: 'p-003',
    providerDisplayName: 'Chris Miller',
    serviceTitle: 'Garden Maintenance',
    serviceCategory: 'Gardening',
    description:
      'Large backyard needs mowing, edging, and hedge trimming. Approximately 400 m².',
    requestPhotos: [
      'https://placehold.co/600x400?text=Backyard',
      'https://placehold.co/600x400?text=Hedge',
      'https://placehold.co/600x400?text=Lawn',
    ],
    requestedDate: '2026-09-18T07:00:00.000Z',
    createdAt: '2026-09-05T12:00:00.000Z',
    updatedAt: '2026-09-08T15:30:00.000Z',
    status: 'consultation_paid',
    suggestedPrice: 400,
    consultationFee: 120,
    consultationPaidAt: '2026-09-08T15:30:00.000Z',
    priceHistory: [
      {
        stage: 'suggested',
        amount: 400,
        at: '2026-09-05T12:00:00.000Z',
        byUserId: 'c-003',
      },
      {
        stage: 'consultation',
        amount: 120,
        at: '2026-09-08T15:30:00.000Z',
        byUserId: 'c-003',
        note: 'Consultation fee paid.',
      },
    ],
    siteVisited: false,
    clientSharedFields: {
      displayName: true,
      phone: true,
      address: true,
      gateCode: false,
      specialInstructions: false,
    },
  },

  // ------------------------------------------
  // 4. Evaluated — site visited, photos uploaded, awaiting final price
  // ------------------------------------------
  {
    id: 'b-004',
    requestRef: buildRequestRef(4, 2026),
    clientId: 'c-004',
    clientDisplayName: 'Sarah Wilson',
    providerId: 'p-004',
    providerDisplayName: 'Lisa Anderson',
    serviceTitle: 'House Cleaning',
    serviceCategory: 'Cleaning',
    description: 'Deep clean of 3-bedroom house before move-in.',
    requestPhotos: ['https://placehold.co/600x400?text=Living+Room'],
    requestedDate: '2026-09-20T09:00:00.000Z',
    createdAt: '2026-09-06T09:00:00.000Z',
    updatedAt: '2026-09-10T11:00:00.000Z',
    status: 'evaluated',
    suggestedPrice: 500,
    consultationFee: 100,
    consultationPaidAt: '2026-09-07T16:00:00.000Z',
    priceHistory: [
      {
        stage: 'suggested',
        amount: 500,
        at: '2026-09-06T09:00:00.000Z',
        byUserId: 'c-004',
      },
      {
        stage: 'consultation',
        amount: 100,
        at: '2026-09-07T16:00:00.000Z',
        byUserId: 'c-004',
      },
    ],
    siteVisited: true,
    consultationPhotos: [
      'https://placehold.co/600x400?text=Room+1',
      'https://placehold.co/600x400?text=Room+2',
      'https://placehold.co/600x400?text=Kitchen',
    ],
    consultationNotes:
      'Property is larger than expected. Requires two cleaners for roughly 6 hours. Carpets need steam cleaning.',
    clientSharedFields: {
      displayName: true,
      phone: true,
      address: true,
      gateCode: true,
      specialInstructions: true,
    },
  },

  // ------------------------------------------
  // 5. Final price proposed — awaiting client
  // ------------------------------------------
  {
    id: 'b-005',
    requestRef: buildRequestRef(5, 2026),
    clientId: 'c-005',
    clientDisplayName: 'David Nkosi',
    providerId: 'p-005',
    providerDisplayName: 'Peter Zulu',
    serviceTitle: 'Roof Repair',
    serviceCategory: 'Roofing',
    description: 'Loose tiles after last storm. Small leak in one corner.',
    requestPhotos: ['https://placehold.co/600x400?text=Roof'],
    requestedDate: '2026-09-22T08:00:00.000Z',
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: '2026-09-11T09:00:00.000Z',
    status: 'price_proposed',
    suggestedPrice: 800,
    consultationFee: 200,
    consultationPaidAt: '2026-09-04T14:00:00.000Z',
    finalPrice: 1450,
    priceHistory: [
      {
        stage: 'suggested',
        amount: 800,
        at: '2026-09-02T10:00:00.000Z',
        byUserId: 'c-005',
      },
      {
        stage: 'consultation',
        amount: 200,
        at: '2026-09-04T14:00:00.000Z',
        byUserId: 'c-005',
      },
      {
        stage: 'final_proposed',
        amount: 1450,
        at: '2026-09-11T09:00:00.000Z',
        byUserId: 'p-005',
        note: 'Includes replacement tiles, sealant, and labour.',
      },
    ],
    siteVisited: true,
    consultationPhotos: ['https://placehold.co/600x400?text=Tiles+1'],
    consultationNotes:
      'More damage than initially visible. Requires 12 replacement tiles and waterproofing.',
    clientSharedFields: {
      displayName: true,
      phone: true,
      address: true,
      gateCode: true,
      specialInstructions: true,
    },
  },

  // ------------------------------------------
  // 6. Price agreed — ready to begin work
  // ------------------------------------------
  {
    id: 'b-006',
    requestRef: buildRequestRef(6, 2026),
    clientId: 'c-006',
    clientDisplayName: 'Thandi Mokoena',
    providerId: 'p-006',
    providerDisplayName: 'Sam Patel',
    serviceTitle: 'Painting — Living Room',
    serviceCategory: 'Painting',
    description: 'Repaint a 30 m² living room. Colour already chosen.',
    requestPhotos: ['https://placehold.co/600x400?text=Living+Room'],
    requestedDate: '2026-09-25T08:00:00.000Z',
    createdAt: '2026-09-01T09:00:00.000Z',
    updatedAt: '2026-09-10T16:00:00.000Z',
    status: 'price_agreed',
    suggestedPrice: 600,
    consultationFee: 100,
    consultationPaidAt: '2026-09-02T12:00:00.000Z',
    finalPrice: 750,
    priceHistory: [
      {
        stage: 'suggested',
        amount: 600,
        at: '2026-09-01T09:00:00.000Z',
        byUserId: 'c-006',
      },
      {
        stage: 'consultation',
        amount: 100,
        at: '2026-09-02T12:00:00.000Z',
        byUserId: 'c-006',
      },
      {
        stage: 'final_proposed',
        amount: 750,
        at: '2026-09-08T10:00:00.000Z',
        byUserId: 'p-006',
      },
      {
        stage: 'final_agreed',
        amount: 750,
        at: '2026-09-10T16:00:00.000Z',
        byUserId: 'c-006',
        note: 'Client accepted final price.',
      },
    ],
    siteVisited: true,
    consultationPhotos: ['https://placehold.co/600x400?text=Wall'],
    consultationNotes: 'Walls in good condition — just needs two coats.',
    clientSharedFields: {
      displayName: true,
      phone: true,
      address: true,
      gateCode: true,
      specialInstructions: true,
    },
  },

  // ------------------------------------------
  // 7. In progress — work session active
  // ------------------------------------------
  {
    id: 'b-007',
    requestRef: buildRequestRef(7, 2026),
    clientId: 'c-007',
    clientDisplayName: 'Naledi Dlamini',
    providerId: 'p-007',
    providerDisplayName: 'Andile Khumalo',
    serviceTitle: 'Bathroom Renovation',
    serviceCategory: 'Renovation',
    description:
      'Full bathroom renovation — new tiles, shower, basin, toilet. Project spans ~5 days.',
    requestPhotos: ['https://placehold.co/600x400?text=Bathroom+Before'],
    requestedDate: '2026-09-12T07:00:00.000Z',
    createdAt: '2026-08-30T09:00:00.000Z',
    updatedAt: '2026-09-11T17:00:00.000Z',
    status: 'in_progress',
    suggestedPrice: 4500,
    consultationFee: 300,
    consultationPaidAt: '2026-09-01T12:00:00.000Z',
    finalPrice: 5800,
    priceHistory: [
      {
        stage: 'suggested',
        amount: 4500,
        at: '2026-08-30T09:00:00.000Z',
        byUserId: 'c-007',
      },
      {
        stage: 'consultation',
        amount: 300,
        at: '2026-09-01T12:00:00.000Z',
        byUserId: 'c-007',
      },
      {
        stage: 'final_proposed',
        amount: 5800,
        at: '2026-09-05T15:00:00.000Z',
        byUserId: 'p-007',
      },
      {
        stage: 'final_agreed',
        amount: 5800,
        at: '2026-09-07T09:00:00.000Z',
        byUserId: 'c-007',
      },
    ],
    siteVisited: true,
    consultationPhotos: [
      'https://placehold.co/600x400?text=Bath+Wall',
      'https://placehold.co/600x400?text=Bath+Floor',
    ],
    consultationNotes:
      'Old tiles need full removal. Plumbing upgrade required for new shower.',
    clientSharedFields: {
      displayName: true,
      phone: true,
      address: true,
      gateCode: true,
      specialInstructions: true,
    },
    workSessionId: 'ws-001',
  },

  // ------------------------------------------
  // 8. Completed — ready for review
  // ------------------------------------------
  {
    id: 'b-008',
    requestRef: buildRequestRef(8, 2026),
    clientId: 'c-008',
    clientDisplayName: 'Ahmed Patel',
    providerId: 'p-008',
    providerDisplayName: 'Grace Ndlovu',
    serviceTitle: 'Fence Installation',
    serviceCategory: 'Building',
    description: 'Install 40 m of palisade fencing around the front yard.',
    requestPhotos: ['https://placehold.co/600x400?text=Yard'],
    requestedDate: '2026-09-01T08:00:00.000Z',
    createdAt: '2026-08-20T09:00:00.000Z',
    updatedAt: '2026-09-05T17:00:00.000Z',
    status: 'completed',
    suggestedPrice: 6500,
    consultationFee: 250,
    consultationPaidAt: '2026-08-22T10:00:00.000Z',
    finalPrice: 7200,
    priceHistory: [
      {
        stage: 'suggested',
        amount: 6500,
        at: '2026-08-20T09:00:00.000Z',
        byUserId: 'c-008',
      },
      {
        stage: 'consultation',
        amount: 250,
        at: '2026-08-22T10:00:00.000Z',
        byUserId: 'c-008',
      },
      {
        stage: 'final_proposed',
        amount: 7200,
        at: '2026-08-25T11:00:00.000Z',
        byUserId: 'p-008',
      },
      {
        stage: 'final_agreed',
        amount: 7200,
        at: '2026-08-26T09:00:00.000Z',
        byUserId: 'c-008',
      },
    ],
    siteVisited: true,
    consultationPhotos: ['https://placehold.co/600x400?text=Yard+Before'],
    consultationNotes: 'Ground slightly uneven — will need extra posts.',
    clientSharedFields: {
      displayName: true,
      phone: true,
      address: true,
      gateCode: true,
      specialInstructions: true,
    },
    workSessionId: 'ws-002',
  },

  // ------------------------------------------
  // 9. Declined by provider — kind reason
  // ------------------------------------------
  {
    id: 'b-009',
    requestRef: buildRequestRef(9, 2026),
    clientId: 'c-009',
    clientDisplayName: 'Lerato Sithole',
    providerId: 'p-009',
    providerDisplayName: 'Ryan Botha',
    serviceTitle: 'Solar Panel Installation',
    serviceCategory: 'Electrical',
    description: 'Install 8 solar panels and inverter.',
    requestPhotos: ['https://placehold.co/600x400?text=Roof'],
    requestedDate: '2026-09-28T08:00:00.000Z',
    createdAt: '2026-09-08T09:00:00.000Z',
    updatedAt: '2026-09-09T10:00:00.000Z',
    status: 'declined',
    declineReason:
      "Hi Lerato, thanks for the request. Unfortunately I'm fully booked for the next three weeks and would not be able to give your project the attention it needs. I'd recommend reaching out to another installer on ServiceConnect — happy to help you compare if you need. Wishing you the best!",
    suggestedPrice: 25000,
    consultationFee: 0,
    priceHistory: [
      {
        stage: 'suggested',
        amount: 25000,
        at: '2026-09-08T09:00:00.000Z',
        byUserId: 'c-009',
      },
    ],
    siteVisited: false,
    clientSharedFields: {
      displayName: true,
      phone: false,
      address: false,
      gateCode: false,
      specialInstructions: false,
    },
  },

  // ------------------------------------------
  // 10. Price disputed — admin intervention needed
  // ------------------------------------------
  {
    id: 'b-010',
    requestRef: buildRequestRef(10, 2026),
    clientId: 'c-010',
    clientDisplayName: 'Zanele Mahlangu',
    providerId: 'p-010',
    providerDisplayName: 'Michael Naidoo',
    serviceTitle: 'Kitchen Tiling',
    serviceCategory: 'Renovation',
    description: 'Tile kitchen floor and backsplash, roughly 18 m².',
    requestPhotos: ['https://placehold.co/600x400?text=Kitchen'],
    requestedDate: '2026-09-30T08:00:00.000Z',
    createdAt: '2026-08-25T09:00:00.000Z',
    updatedAt: '2026-09-03T14:00:00.000Z',
    status: 'price_disputed',
    suggestedPrice: 2500,
    consultationFee: 150,
    consultationPaidAt: '2026-08-27T12:00:00.000Z',
    finalPrice: 4200,
    priceHistory: [
      {
        stage: 'suggested',
        amount: 2500,
        at: '2026-08-25T09:00:00.000Z',
        byUserId: 'c-010',
      },
      {
        stage: 'consultation',
        amount: 150,
        at: '2026-08-27T12:00:00.000Z',
        byUserId: 'c-010',
      },
      {
        stage: 'final_proposed',
        amount: 4200,
        at: '2026-09-01T10:00:00.000Z',
        byUserId: 'p-010',
        note: 'Extra prep work required — old tiles are set in thick mortar.',
      },
    ],
    siteVisited: true,
    consultationPhotos: ['https://placehold.co/600x400?text=Old+Tile'],
    consultationNotes:
      'Existing tiles are set on a thick mortar bed. Removal will add 2 days.',
    clientSharedFields: {
      displayName: true,
      phone: true,
      address: true,
      gateCode: false,
      specialInstructions: true,
    },
  },
];

// ============================================
// HELPERS
// ============================================

export const getBookingById = (id: string): Booking | undefined =>
  demoBookings.find((b) => b.id === id);

export const getBookingsByClient = (clientId: string): Booking[] =>
  demoBookings.filter((b) => b.clientId === clientId);

export const getBookingsByProvider = (providerId: string): Booking[] =>
  demoBookings.filter((b) => b.providerId === providerId);

// ============================================
// APPENDED FOR STEP 4 — John Doe ↔ Tom Brown
// ============================================
//
// These two bookings pair the demo "current user" ids (c-001, p-001)
// so the clock-in flow is visible on the Client and Provider dashboards
// without swapping demo ids.
//
// b-011 → in-progress (active work session ws-003)
// b-012 → completed  (closed work session ws-004)

demoBookings.push(
  {
    id: 'b-011',
    requestRef: buildRequestRef(11, 2026),
    clientId: 'c-001',
    clientDisplayName: 'John Doe',
    providerId: 'p-001',
    providerDisplayName: 'Tom Brown',
    serviceTitle: 'Bathroom Tap Replacement',
    serviceCategory: 'Plumbing',
    description:
      'Replace two bathroom taps and reseal the basin. Small job, expected to be done in one day.',
    requestPhotos: [
      'https://placehold.co/600x400?text=Tap+1',
      'https://placehold.co/600x400?text=Tap+2',
    ],
    requestedDate: '2026-09-12T08:00:00.000Z',
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-12T07:05:00.000Z',
    status: 'in_progress',
    suggestedPrice: 400,
    consultationFee: 100,
    consultationPaidAt: '2026-09-07T14:00:00.000Z',
    finalPrice: 480,
    priceHistory: [
      {
        stage: 'suggested',
        amount: 400,
        at: '2026-09-05T10:00:00.000Z',
        byUserId: 'c-001',
        note: 'Client-suggested amount — not binding.',
      },
      {
        stage: 'consultation',
        amount: 100,
        at: '2026-09-07T14:00:00.000Z',
        byUserId: 'c-001',
      },
      {
        stage: 'final_proposed',
        amount: 480,
        at: '2026-09-09T11:00:00.000Z',
        byUserId: 'p-001',
        note: 'Includes replacement taps, sealant and labour.',
      },
      {
        stage: 'final_agreed',
        amount: 480,
        at: '2026-09-10T09:00:00.000Z',
        byUserId: 'c-001',
      },
    ],
    siteVisited: true,
    consultationPhotos: [
      'https://placehold.co/600x400?text=Basin+Before',
    ],
    consultationNotes:
      'Both taps are worn. Quick job — no plumbing rework needed.',
    clientSharedFields: {
      displayName: true,
      phone: true,
      address: true,
      gateCode: true,
      specialInstructions: false,
    },
    workSessionId: 'ws-003',
  },
  {
    id: 'b-012',
    requestRef: buildRequestRef(12, 2026),
    clientId: 'c-001',
    clientDisplayName: 'John Doe',
    providerId: 'p-001',
    providerDisplayName: 'Tom Brown',
    serviceTitle: 'Kitchen Sink Leak Repair',
    serviceCategory: 'Plumbing',
    description:
      'Leaking drain under the kitchen sink. Replaced seal and tightened fitting.',
    requestPhotos: [
      'https://placehold.co/600x400?text=Leak+Before',
    ],
    requestedDate: '2026-09-02T09:00:00.000Z',
    createdAt: '2026-08-28T09:00:00.000Z',
    updatedAt: '2026-09-02T16:30:00.000Z',
    status: 'completed',
    suggestedPrice: 300,
    consultationFee: 100,
    consultationPaidAt: '2026-08-29T10:00:00.000Z',
    finalPrice: 350,
    priceHistory: [
      {
        stage: 'suggested',
        amount: 300,
        at: '2026-08-28T09:00:00.000Z',
        byUserId: 'c-001',
      },
      {
        stage: 'consultation',
        amount: 100,
        at: '2026-08-29T10:00:00.000Z',
        byUserId: 'c-001',
      },
      {
        stage: 'final_proposed',
        amount: 350,
        at: '2026-08-30T11:00:00.000Z',
        byUserId: 'p-001',
      },
      {
        stage: 'final_agreed',
        amount: 350,
        at: '2026-08-31T09:00:00.000Z',
        byUserId: 'c-001',
      },
    ],
    siteVisited: true,
    consultationPhotos: [
      'https://placehold.co/600x400?text=Sink+Before',
    ],
    consultationNotes: 'Simple seal replacement.',
    clientSharedFields: {
      displayName: true,
      phone: true,
      address: true,
      gateCode: true,
      specialInstructions: false,
    },
    workSessionId: 'ws-004',
  }
);
