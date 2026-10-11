// src/data/demoUsers.ts
//
// DEV ONLY — seeded demo accounts used by the /dev-login page.
// These are never sent to the backend. Remove this file when going to production.

import type { User } from '../account/types/user';

export interface DemoUserSeed {
  /** Human label shown on the dev-login button */
  label: string;
  /** The role this seed represents */
  role: 'CLIENT' | 'PROVIDER' | 'EMPLOYEE' | 'ADMIN';
  /** The full user object written to localStorage */
  user: User;
}

const baseFields = {
  status: 'active' as const,
  emailVerified: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

export const DEMO_USERS: DemoUserSeed[] = [
  {
    label: 'John Doe',
    role: 'CLIENT',
    user: {
      ...baseFields,
      id: 'demo-client-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'CLIENT',
    },
  },
  {
    label: 'Tom Brown',
    role: 'PROVIDER',
    user: {
      ...baseFields,
      id: 'demo-provider-1',
      firstName: 'Tom',
      lastName: 'Brown',
      email: 'tom@example.com',
      role: 'PROVIDER',
    },
  },
  {
    label: 'Emma White',
    role: 'EMPLOYEE',
    user: {
      ...baseFields,
      id: 'demo-employee-1',
      firstName: 'Emma',
      lastName: 'White',
      email: 'emma@example.com',
      role: 'EMPLOYEE',
    },
  },
  {
    label: 'Alice Admin',
    role: 'ADMIN',
    user: {
      ...baseFields,
      id: 'demo-admin-1',
      firstName: 'Alice',
      lastName: 'Admin',
      email: 'alice@example.com',
      role: 'ADMIN',
    },
  },
];

export const getDemoUserByRole = (
  role: DemoUserSeed['role']
): DemoUserSeed | undefined => DEMO_USERS.find((d) => d.role === role);

// A demo token that the patched AuthContext recognises as "trust the stored user"
export const DEMO_TOKEN = 'demo-token';

// Helper to build a custom demo user from the register form
export const buildCustomDemoUser = (opts: {
  firstName: string;
  lastName: string;
  email: string;
  role: DemoUserSeed['role'];
}): User => ({
  ...baseFields,
  id: `demo-${opts.role.toLowerCase()}-${Date.now()}`,
  firstName: opts.firstName,
  lastName: opts.lastName,
  email: opts.email,
  role: opts.role,
});
