// src/utils/demoIds.ts
//
// Central place for resolving the "current user id" during the demo phase.
// Each role maps to a stable id that our demo data uses.

import type { User } from '../account/types/user';

/** Stable ids used by demo data across bookings, work sessions, chat, etc. */
export const DEMO_IDS = {
  CLIENT: 'c-001',
  PROVIDER: 'p-001',
  EMPLOYEE: 'e-001',
  ADMIN: 'a-001',
} as const;

export type DemoRole = keyof typeof DEMO_IDS;

/**
 * Given the logged-in user, return the id that matches our demo data.
 * Falls back to the CLIENT id if the role is unknown.
 */
export const resolveDemoUserId = (user: User | null | undefined): string => {
  if (!user) return DEMO_IDS.CLIENT;
  const role = user.role as DemoRole;
  return DEMO_IDS[role] ?? DEMO_IDS.CLIENT;
};
