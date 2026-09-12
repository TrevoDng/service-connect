// src/utils/referenceCode.ts
// Reference code generators used by clock-in (security) and booking requests.

// ============================================
// CLOCK-IN SECURITY CODE
// ============================================
//
// Format: SC-XXXX-XX
//   SC   → ServiceConnect prefix
//   XXXX → 4 digits (0000-9999)
//   XX   → 2 uppercase letters
//
// Examples: SC-4821-KD, SC-0073-AB, SC-9999-ZZ
//
// Ambiguous characters are avoided entirely because the alphabet is only
// 26 letters and digits are 0-9. If you ever want to exclude specific
// characters (0/O, 1/I), swap DIGITS/LETTERS below for a custom alphabet.

const DIGITS = '0123456789';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const randomFrom = (chars: string, count: number): string => {
  let out = '';
  for (let i = 0; i < count; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
};

/**
 * Generate a fresh clock-in security code, e.g. "SC-4821-KD".
 * Each code is single-use and should be invalidated on clock-out.
 */
export const generateClockInCode = (): string => {
  const digits = randomFrom(DIGITS, 4);
  const letters = randomFrom(LETTERS, 2);
  return `SC-${digits}-${letters}`;
};

/**
 * How long a freshly generated code stays valid, in milliseconds.
 * 30 minutes by default.
 */
export const CLOCK_IN_CODE_TTL_MS = 30 * 60 * 1000;

/**
 * Returns true if a reference code's expiry timestamp is in the past.
 */
export const isCodeExpired = (expiresAt?: string): boolean => {
  if (!expiresAt) return true;
  const expiry = new Date(expiresAt).getTime();
  if (isNaN(expiry)) return true;
  return Date.now() > expiry;
};

/**
 * Convenience: returns the ISO timestamp for "now + TTL".
 */
export const clockInCodeExpiry = (): string => {
  return new Date(Date.now() + CLOCK_IN_CODE_TTL_MS).toISOString();
};

// ============================================
// BOOKING REQUEST REFERENCE
// ============================================
//
// Format: REQ-YYYY-NNNN
//   REQ  → Request
//   YYYY → current year
//   NNNN → zero-padded sequence number, caller provides the number
//
// The sequence number comes from the backend later (auto-increment).
// For demo data, pass any integer.

/**
 * Build a request reference string.
 * @param sequence - 1-based integer, e.g. 42 → "REQ-2026-0042"
 * @param year     - defaults to the current year
 */
export const buildRequestRef = (sequence: number, year?: number): string => {
  const y = year ?? new Date().getFullYear();
  const seq = String(Math.max(1, Math.floor(sequence))).padStart(4, '0');
  return `REQ-${y}-${seq}`;
};

// ============================================
// GENERIC ID
// ============================================
//
// Simple unique ID for demo/local state. When we wire a real backend,
// IDs will come from the server — this is a placeholder that's good
// enough for React keys and demo data.

/**
 * Short random ID, 12 chars. Good enough for React keys and demo entities.
 */
export const generateId = (): string => {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-6);
};
