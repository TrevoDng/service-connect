// src/data/demoNotifications.ts
import type { Notification } from '../types';

// ============================================
// DEMO NOTIFICATIONS
// ============================================
//
// Single flat array — callers filter by `userId` and optionally by `readAt`.
//
// Coverage:
//   - Every NotificationType fires at least once
//   - Priorities span low / normal / high
//   - Mix of read and unread (so the bell badge shows a non-zero count)
//   - Deep-link targets point to real routes
//
// The dates step backwards from 2026-09-12 so `formatRelative` shows a
// range of outputs ("2 h ago", "yesterday", "3 days ago", ...).

export const demoNotifications: Notification[] = [
  // ==========================================
  // CLIENT c-001 (John Doe) — the "active" client
  // ==========================================
  {
    id: 'n-001',
    userId: 'c-001',
    type: 'booking_declined',
    priority: 'normal',
    title: 'Request declined',
    message:
      "Ryan Botha declined your Solar Panel Installation request. You can now choose a different provider.",
    linkTo: '/client/dashboard',
    actorId: 'p-009',
    actorDisplayName: 'Ryan Botha',
    bookingId: 'b-009',
    createdAt: '2026-09-12T10:30:00.000Z',
  },
  {
    id: 'n-002',
    userId: 'c-001',
    type: 'chat_message',
    priority: 'normal',
    title: 'New message from Lisa Anderson',
    message: 'Understood — happy to give you a quote on the carpets too.',
    linkTo: '/client/dashboard?thread=ct-003',
    actorId: 'p-004',
    actorDisplayName: 'Lisa Anderson',
    threadId: 'ct-003',
    createdAt: '2026-09-12T09:15:00.000Z',
  },
  {
    id: 'n-003',
    userId: 'c-001',
    type: 'account_approved',
    priority: 'low',
    title: 'Account verified',
    message: 'Your client account has been fully verified. Welcome to ServiceConnect!',
    createdAt: '2026-09-10T08:00:00.000Z',
    readAt: '2026-09-10T08:05:00.000Z',
  },

  // ==========================================
  // CLIENT c-007 (Naledi Dlamini) — active bathroom job
  // ==========================================
  {
    id: 'n-010',
    userId: 'c-007',
    type: 'photos_uploaded',
    priority: 'normal',
    title: 'New progress photos',
    message: 'Andile Khumalo uploaded 2 new photos from today\'s work.',
    linkTo: '/client/dashboard?booking=b-007',
    actorId: 'p-007',
    actorDisplayName: 'Andile Khumalo',
    bookingId: 'b-007',
    workSessionId: 'ws-001',
    createdAt: '2026-09-12T12:00:00.000Z',
  },
  {
    id: 'n-011',
    userId: 'c-007',
    type: 'clock_in',
    priority: 'high',
    title: 'Provider at your gate',
    message:
      'Andile Khumalo has arrived. Reference code: SC-4821-KD. Confirm only if it matches.',
    linkTo: '/client/dashboard?booking=b-007',
    actorId: 'p-007',
    actorDisplayName: 'Andile Khumalo',
    bookingId: 'b-007',
    workSessionId: 'ws-001',
    createdAt: '2026-09-12T07:02:00.000Z',
    readAt: '2026-09-12T07:04:00.000Z',
  },
  {
    id: 'n-012',
    userId: 'c-007',
    type: 'price_proposed',
    priority: 'high',
    title: 'Final price proposed',
    message:
      'Andile Khumalo proposed a final price of R5,800 for your Bathroom Renovation.',
    linkTo: '/client/dashboard?booking=b-007',
    actorId: 'p-007',
    actorDisplayName: 'Andile Khumalo',
    bookingId: 'b-007',
    createdAt: '2026-09-05T15:00:00.000Z',
    readAt: '2026-09-05T15:20:00.000Z',
  },

  // ==========================================
  // CLIENT c-008 (Ahmed Patel) — completed job
  // ==========================================
  {
    id: 'n-020',
    userId: 'c-008',
    type: 'job_completed',
    priority: 'normal',
    title: 'Job completed',
    message:
      'Grace Ndlovu has completed your Fence Installation. Please leave a review.',
    linkTo: '/client/dashboard?booking=b-008',
    actorId: 'p-008',
    actorDisplayName: 'Grace Ndlovu',
    bookingId: 'b-008',
    workSessionId: 'ws-002',
    createdAt: '2026-09-05T15:30:00.000Z',
  },
  {
    id: 'n-021',
    userId: 'c-008',
    type: 'clock_out',
    priority: 'low',
    title: 'Provider left the site',
    message: 'Grace Ndlovu has clocked out for the day.',
    linkTo: '/client/dashboard?booking=b-008',
    bookingId: 'b-008',
    createdAt: '2026-09-03T17:00:00.000Z',
    readAt: '2026-09-03T17:30:00.000Z',
  },

  // ==========================================
  // PROVIDER p-001 (Tom Brown) — new request
  // ==========================================
  {
    id: 'n-100',
    userId: 'p-001',
    type: 'booking_requested',
    priority: 'high',
    title: 'New booking request',
    message:
      'John Doe requested a Plumbing Repair. Suggested price: R350.',
    linkTo: '/provider/dashboard',
    actorId: 'c-001',
    actorDisplayName: 'John Doe',
    bookingId: 'b-001',
    createdAt: '2026-09-10T14:00:00.000Z',
  },
  {
    id: 'n-101',
    userId: 'p-001',
    type: 'chat_message',
    priority: 'normal',
    title: 'New message from John Doe',
    message: 'Perfect, that works for me. I will send a booking request now.',
    linkTo: '/provider/dashboard?thread=ct-001',
    actorId: 'c-001',
    actorDisplayName: 'John Doe',
    threadId: 'ct-001',
    createdAt: '2026-09-10T09:15:00.000Z',
  },

  // ==========================================
  // PROVIDER p-002 (Emily Davis)
  // ==========================================
  {
    id: 'n-110',
    userId: 'p-002',
    type: 'consultation_paid',
    priority: 'normal',
    title: 'Consultation fee received',
    message: 'Jane Smith paid the R150 consultation fee for Electrical Installation.',
    linkTo: '/provider/dashboard',
    actorId: 'c-002',
    actorDisplayName: 'Jane Smith',
    bookingId: 'b-002',
    createdAt: '2026-09-09T14:00:00.000Z',
    readAt: '2026-09-09T14:10:00.000Z',
  },
  {
    id: 'n-111',
    userId: 'p-002',
    type: 'booking_requested',
    priority: 'normal',
    title: 'New booking request',
    message: 'Jane Smith requested an Electrical Installation job.',
    linkTo: '/provider/dashboard',
    actorId: 'c-002',
    actorDisplayName: 'Jane Smith',
    bookingId: 'b-002',
    createdAt: '2026-09-08T09:00:00.000Z',
    readAt: '2026-09-08T09:20:00.000Z',
  },

  // ==========================================
  // PROVIDER p-007 (Andile Khumalo) — active job
  // ==========================================
  {
    id: 'n-120',
    userId: 'p-007',
    type: 'clock_confirmed',
    priority: 'normal',
    title: 'Client confirmed at the gate',
    message: 'Naledi Dlamini confirmed your arrival. You can proceed.',
    linkTo: '/provider/dashboard',
    actorId: 'c-007',
    actorDisplayName: 'Naledi Dlamini',
    bookingId: 'b-007',
    workSessionId: 'ws-001',
    createdAt: '2026-09-12T07:04:00.000Z',
  },
  {
    id: 'n-121',
    userId: 'p-007',
    type: 'price_agreed',
    priority: 'high',
    title: 'Price agreed',
    message: 'Naledi Dlamini accepted your proposed price of R5,800.',
    linkTo: '/provider/dashboard',
    actorId: 'c-007',
    actorDisplayName: 'Naledi Dlamini',
    bookingId: 'b-007',
    createdAt: '2026-09-07T09:00:00.000Z',
    readAt: '2026-09-07T09:15:00.000Z',
  },

  // ==========================================
  // ADMIN a-001
  // ==========================================
  {
    id: 'n-200',
    userId: 'a-001',
    type: 'price_disputed',
    priority: 'high',
    title: 'Price dispute needs attention',
    message:
      'Zanele Mahlangu and Michael Naidoo could not agree on the final price for Kitchen Tiling.',
    linkTo: '/admin-dashboard',
    bookingId: 'b-010',
    createdAt: '2026-09-03T14:00:00.000Z',
  },
  {
    id: 'n-201',
    userId: 'a-001',
    type: 'account_pending',
    priority: 'normal',
    title: 'New registration awaiting approval',
    message: 'James Taylor (employee) submitted a registration request.',
    linkTo: '/admin-dashboard',
    createdAt: '2026-09-01T11:00:00.000Z',
  },

  // ==========================================
  // EMPLOYEE e-001
  // ==========================================
  {
    id: 'n-300',
    userId: 'e-001',
    type: 'account_pending',
    priority: 'normal',
    title: 'New provider awaiting approval',
    message: 'Chris Miller signed up as a service provider and is awaiting approval.',
    linkTo: '/employee-dashboard',
    createdAt: '2026-09-10T09:00:00.000Z',
  },
  {
    id: 'n-301',
    userId: 'e-001',
    type: 'account_pending',
    priority: 'normal',
    title: 'New client awaiting approval',
    message: 'Mike Johnson signed up as a client and is awaiting approval.',
    linkTo: '/employee-dashboard',
    createdAt: '2026-09-10T08:00:00.000Z',
    readAt: '2026-09-10T08:30:00.000Z',
  },
];

// ============================================
// HELPERS
// ============================================

export const getNotificationsForUser = (userId: string): Notification[] =>
  demoNotifications
    .filter((n) => n.userId === userId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

export const getUnreadCount = (userId: string): number =>
  demoNotifications.filter((n) => n.userId === userId && !n.readAt).length;

export const getUnreadNotifications = (userId: string): Notification[] =>
  demoNotifications.filter((n) => n.userId === userId && !n.readAt);
