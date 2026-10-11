// src/account/utils/resolveUserId.ts
//
// Resolves the "current user id" that matches demo data across the app
// (bookings, work sessions, disputes, reviews, notifications).
//
// Seeded demo users (c-001, p-001, e-001, a-001) already have the right
// id, so we return it directly. Custom demo users created via /dev-login
// get a generated id that doesn't exist in demo data — for those we fall
// back to the role's seeded id so the demo experience still works.
//
// When the backend is live and every user has a real id, this can be
// deleted and callers can simply read `user.id`.

import type { User } from '../types/user';

export const DEMO_ROLE_IDS: Record<string, string> = {
  CLIENT: 'c-001',
  PROVIDER: 'p-001',
  EMPLOYEE: 'e-001',
  ADMIN: 'a-001',
};

// Ids that exist in demo data. Anything else is treated as a custom
// demo user and falls back to their role's seeded id.
const SEEDED_IDS = new Set(Object.values(DEMO_ROLE_IDS));

export const resolveUserId = (user: User | null | undefined): string => {
  if (!user) return DEMO_ROLE_IDS.CLIENT;

  // Seeded user — id already matches demo data
  if (user.id && SEEDED_IDS.has(user.id)) {
    return user.id;
  }

  // Custom demo user — fall back by role
  const role = user.role ?? 'CLIENT';
  return DEMO_ROLE_IDS[role] ?? DEMO_ROLE_IDS.CLIENT;
};
