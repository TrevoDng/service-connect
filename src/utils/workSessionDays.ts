// src/utils/workSessionDays.ts
//
// Groups a work session's clock events into "days" — one entry per
// clock-in / clock-out pair (or an open pair if the provider is still on
// site). Each day carries the photos and progress stages that fall within
// its time window.

import type { WorkSession, WorkPhoto, ProgressStage } from '../types';

export interface WorkDay {
  /** 1-based index for display */
  index: number;
  /** ISO timestamp of the clock-in for this day */
  startAt: string;
  /** ISO timestamp of the clock-out, if the day is closed */
  endAt?: string;
  /** True when the day is still open (provider hasn't clocked out) */
  isOpen: boolean;
  /** Whether the client confirmed the gate for this day */
  gateConfirmed: boolean;
  /** Reference code shown to the client this day */
  referenceCode?: string;
  /** Before photos (only present on day 1) */
  beforePhotos: WorkPhoto[];
  /** Progress stages uploaded during this day */
  progressStages: ProgressStage[];
  /** Final photos (only present on the last day, if complete) */
  finalPhotos: WorkPhoto[];
}

// ============================================
// HELPERS
// ============================================

const isSameDay = (isoA: string, isoB: string): boolean => {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const isBetween = (iso: string, start: string, end?: string): boolean => {
  const t = new Date(iso).getTime();
  const s = new Date(start).getTime();
  if (isNaN(t) || isNaN(s)) return false;
  if (t < s) return false;
  if (!end) return true;
  const e = new Date(end).getTime();
  if (isNaN(e)) return true;
  return t <= e;
};

// ============================================
// MAIN
// ============================================

export const groupSessionIntoDays = (session: WorkSession): WorkDay[] => {
  const days: WorkDay[] = [];
  const events = session.clockEvents;
  const totalPhotos = session.finalPhotos.length;

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.type !== 'in') continue;

    // Find matching out event (the next 'out' after this 'in')
    let outEvent: (typeof events)[number] | undefined;
    for (let j = i + 1; j < events.length; j++) {
      if (events[j].type === 'out') {
        outEvent = events[j];
        break;
      }
    }

    const startAt = e.at;
    const endAt = outEvent?.at;
    const dayIndex = days.length + 1;

    // Photos uploaded during this day's window
    const dayPhotos = (photos: WorkPhoto[]): WorkPhoto[] =>
      photos.filter((p) => isBetween(p.uploadedAt, startAt, endAt));

    const dayStages = session.progressStages.filter((st) =>
      isBetween(st.date, startAt, endAt)
    );

    // Before photos only on the first day
    const beforePhotos = dayIndex === 1 ? session.beforePhotos : [];

    // Final photos only on the last day, only if the session is complete
    const isLastDay = dayIndex === days.length + 1 && i === events.length - 1;
    const finalPhotos =
      session.status === 'completed' && totalPhotos > 0 ? session.finalPhotos : [];

    days.push({
      index: dayIndex,
      startAt,
      endAt,
      isOpen: !endAt,
      gateConfirmed: e.confirmedByClient === true,
      referenceCode: e.referenceCode,
      beforePhotos,
      progressStages: dayStages,
      // Only attach final photos to the very last day
      finalPhotos: isLastDay ? finalPhotos : [],
    });
  }

  return days;
};

// Format a day label like "Mon, 22 Sep 2026"
export const formatDayLabel = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
