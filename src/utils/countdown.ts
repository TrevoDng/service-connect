// src/utils/countdown.ts
// Small helpers for reference-code countdown UI.

/**
 * Returns the number of milliseconds remaining until the given ISO
 * timestamp. Never negative — clamps to 0 if the expiry has passed.
 */
export const msRemaining = (expiresAt?: string): number => {
  if (!expiresAt) return 0;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return isNaN(ms) || ms < 0 ? 0 : ms;
};

/**
 * Formats a duration in milliseconds as "MM:SS".
 *   e.g. 23 minutes 14 seconds → "23:14"
 *         1 minute 5 seconds   → "01:05"
 *         0                    → "00:00"
 */
export const formatCountdown = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

/**
 * Convenience: returns true if the code is within the final 5 minutes.
 * Used to switch the countdown UI to a warning colour.
 */
export const isExpiringSoon = (expiresAt?: string): boolean => {
  const remaining = msRemaining(expiresAt);
  return remaining > 0 && remaining <= 5 * 60 * 1000;
};
