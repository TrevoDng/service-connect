// src/utils/allWorkSessions.ts
//
// Merged reads for work sessions. Combines the demo seed with any sessions
// created at runtime. When the backend is wired, merge it here.

import type { WorkSession } from '../types';
import { demoWorkSessions } from '../data/demoWorkSessions';
import { getLocalWorkSessions } from './localWorkSessions';

export const getAllWorkSessions = (): WorkSession[] => [
  ...getLocalWorkSessions(),
  ...demoWorkSessions,
];

export const getWorkSessionById = (id: string): WorkSession | undefined =>
  getAllWorkSessions().find((s) => s.id === id);

export const getWorkSessionByBooking = (
  bookingId: string
): WorkSession | undefined =>
  getAllWorkSessions().find((s) => s.bookingId === bookingId);

export const getWorkSessionsForProvider = (
  providerId: string
): WorkSession[] =>
  getAllWorkSessions().filter((s) => s.providerId === providerId);

export const getWorkSessionsForClient = (clientId: string): WorkSession[] =>
  getAllWorkSessions().filter((s) => s.clientId === clientId);
