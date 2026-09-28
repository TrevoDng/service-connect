// src/utils/seedChatOnce.ts
//
// ============================================
// TEMPORARY — ONE-TIME DEMO CHAT SEED
// ============================================
//
// When the app boots for the first time on a device (empty localStorage),
// copy the demo chat threads + messages into localStorage so the chat UI
// has something to render.
//
// Idempotent: safe to call on every boot. Exits immediately if the seed
// has already run.
//
// ❗ DELETE THIS FILE alongside src/data/demoChat.ts ❗
// Once both are gone, new users start with an empty chat — which is the
// correct post-demo behavior.

import { demoChatThreads, demoChatMessages } from '../data/demoChat';
import { getLocalThreads, upsertLocalThread, addLocalMessage } from './localChat';

const SEED_FLAG_KEY = 'serviceconnect-chat-seeded';

/**
 * Seed demo chat data into localStorage, once per device.
 *
 * Guards used:
 *   1. A dedicated flag key    → fastest path, "have we run?"
 *   2. Non-empty thread list   → protects against the flag being cleared
 *      while real data still exists
 *   3. Empty storage           → the only case where we actually seed
 */
export const seedChatOnce = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // Guard 1: have we already flagged this device as seeded?
    if (localStorage.getItem(SEED_FLAG_KEY) === 'true') return;

    // Guard 2: if the user already has threads (from any source),
    // don't overwrite — just flip the flag and stop.
    const existingThreads = getLocalThreads();
    if (existingThreads.length > 0) {
      localStorage.setItem(SEED_FLAG_KEY, 'true');
      return;
    }

    // Seed threads — use upsert so we never duplicate.
    for (const thread of demoChatThreads) {
      upsertLocalThread(thread);
    }

    // Seed messages — use addLocalMessage so duplicates are ignored.
    for (const message of demoChatMessages) {
      addLocalMessage(message);
    }

    // Mark this device as seeded.
    localStorage.setItem(SEED_FLAG_KEY, 'true');
  } catch (err) {
    // Never let the seed crash the app. Log and move on — an un-seeded
    // device simply shows an empty chat, which is a valid state.
    console.error('Failed to seed demo chat data:', err);
  }
};

/**
 * Clear the seed flag so the next `seedChatOnce()` call will re-run.
 * For dev use only — most callers should not touch this.
 *
 * NOTE: this does NOT delete the seeded threads/messages. If those
 * still exist, Guard 2 above will simply flip the flag back to true.
 * To force a full reseed, also call clearAllLocalChat() from localChat.
 */
export const resetSeedFlag = (): void => {
  try {
    localStorage.removeItem(SEED_FLAG_KEY);
  } catch (err) {
    console.error('Failed to reset chat seed flag:', err);
  }
};
