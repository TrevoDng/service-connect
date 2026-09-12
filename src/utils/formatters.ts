// src/utils/formatters.ts
// Centralized formatting helpers. All dates use en-ZA locale, all currency is ZAR.

// ============================================
// DATE / TIME
// ============================================

/**
 * Short date: "12 Sep 2026"
 */
export const formatDate = (input: string | Date | undefined | null): string => {
  if (!input) return '-';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Full date with time: "Sat, 12 Sep 2026, 14:30"
 */
export const formatDateTime = (input: string | Date | undefined | null): string => {
  if (!input) return '-';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Time only: "14:30"
 */
export const formatTime = (input: string | Date | undefined | null): string => {
  if (!input) return '-';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Relative time: "just now", "5 min ago", "2 h ago", "3 days ago", or a
 * fallback date for anything older than 7 days.
 */
export const formatRelative = (input: string | Date | undefined | null): string => {
  if (!input) return '-';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(date.getTime())) return '-';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 30) return 'just now';
  if (diffSec < 60) return `${diffSec} sec ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return diffDay === 1 ? 'yesterday' : `${diffDay} days ago`;

  // Older than a week → return a short date
  return formatDate(date);
};

/**
 * Duration in minutes → "2 h 15 min" or "45 min" or "3 days 4 h"
 * Useful for work-session total hours.
 */
export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0 min';
  if (minutes < 60) return `${minutes} min`;

  const totalHours = Math.floor(minutes / 60);
  const remMin = minutes % 60;

  if (totalHours < 24) {
    return remMin === 0
      ? `${totalHours} h`
      : `${totalHours} h ${remMin} min`;
  }

  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  const dayLabel = days === 1 ? '1 day' : `${days} days`;

  if (remHours === 0) return dayLabel;
  return `${dayLabel} ${remHours} h`;
};

// ============================================
// PRICE
// ============================================

/**
 * Formats ZAR. Examples:
 *   formatPrice(350)         → "R350"
 *   formatPrice(350.5)       → "R350.50"
 *   formatPrice(1234567.89)  → "R1 234 567.89"
 */
export const formatPrice = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'R0';
  return `R${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats ZAR with the rand symbol spaced out. Same as formatPrice but
 * suitable for prominent display. Kept separate so we can change one
 * without touching the other later.
 */
export const formatPriceDisplay = (amount: number | undefined | null): string => {
  return formatPrice(amount);
};

// ============================================
// TEXT
// ============================================

/**
 * Truncates text to a max length with an ellipsis.
 */
export const truncate = (text: string, max = 80): string => {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
};

/**
 * Extracts initials from a full name: "John Doe" → "JD"
 */
export const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  const result = (first + last).toUpperCase();
  return result || 'U';
};
