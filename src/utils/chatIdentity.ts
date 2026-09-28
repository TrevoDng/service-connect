// src/utils/chatIdentity.ts
//
// ============================================
// CHAT IDENTITY RESOLVER
// ============================================
//
// The demo login (src/data/demoUsers.ts) issues ids like `demo-client-1`,
// but all demo bookings/chat/notifications are keyed on `c-001` / `p-001`.
// This module bridges that gap during development.
//
// In production — when the real backend issues real ids — this file becomes
// a single line: `return user?.id ?? null`. The mapping table will simply
// never match, and the resolver passes ids through unchanged.
//
// This file has NO dependency on demo data — it doesn't import anything
// from src/data/. The mapping is a hardcoded lookup that will be deleted
// alongside the demo files.

import type { User } from '../account/types/user';

// ============================================
// DEMO ID MAPPING
// ============================================
//
// Maps the ids issued by /dev-login to the ids used by demo content.
// When we delete the demo files, delete this table too.

const DEMO_USER_ID_MAP: Record<string, string> = {
  'demo-client-1': 'c-001',
  'demo-provider-1': 'p-001',
  'demo-employee-1': 'e-001',
  'demo-admin-1': 'a-001',
};

// ============================================
// RESOLVERS
// ============================================

/**
 * Resolve the "effective chat user id" for a user.
 *
 * - Returns `null` when there is no user (unauthenticated / logged out).
 * - Maps known demo ids to their demo-content equivalents.
 * - Passes any other id through unchanged.
 *
 * The `null` case is intentional: it lets every consumer short-circuit
 * cleanly, so no component is forced to fake a user to keep rendering.
 */
export const resolveChatUserId = (user: User | null): string | null => {
  if (!user) return null;
  if (!user.id) return null;
  return DEMO_USER_ID_MAP[user.id] ?? user.id;
};

/**
 * Which side of a thread is the viewer on?
 * Returns `null` when the viewer is neither the client nor the provider —
 * e.g. an observer, an admin browsing, or a user id that isn't part of
 * the thread.
 */
export const resolveViewerRole = (
  viewerUserId: string | null,
  thread: { clientId: string; providerId: string }
): 'CLIENT' | 'PROVIDER' | null => {
  if (!viewerUserId) return null;
  if (thread.clientId === viewerUserId) return 'CLIENT';
  if (thread.providerId === viewerUserId) return 'PROVIDER';
  return null;
};

// ============================================
// OTHER PARTICIPANT HELPER
// ============================================
//
// Frequently needed: "given this thread and this viewer, who is the other
// party?" Used by ChatPanel to render the header, avatar, etc.
//
// Returns `null` if the viewer is not part of the thread (safer than
// silently returning the client — which would show wrong data in edge cases).

export const getOtherParticipant = <T extends { client: unknown; provider: unknown }>(
  viewerRole: 'CLIENT' | 'PROVIDER' | null,
  thread: T
): T['client'] | T['provider'] | null => {
  if (viewerRole === 'CLIENT') return thread.provider;
  if (viewerRole === 'PROVIDER') return thread.client;
  return null;
};
