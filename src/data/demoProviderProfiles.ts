// src/data/demoProviderProfiles.ts
//
// Extended profile info for demo providers. Separate from the User type so
// we don't have to touch auth. When the backend is ready, this becomes an
// API call.

export interface DemoProviderProfile {
  providerId: string;
  about: string;
  /** Categories the provider works in */
  categories: string[];
  /** Total jobs completed (used as fallback when no reviews exist) */
  completedJobs: number;
  /** Verified badge shown on the profile */
  verified: boolean;
  /** Fallback rating when no reviews exist yet */
  seedRating: number;
  /** When the provider joined */
  memberSince: string;
}

export const demoProviderProfiles: DemoProviderProfile[] = [
  {
    providerId: 'p-001',
    about:
      'Licensed plumber with 8 years of experience. I specialise in residential repairs, geyser installations, and emergency leak fixes. All work comes with a 12-month guarantee.',
    categories: ['Plumbing', 'Handyman'],
    completedJobs: 46,
    verified: true,
    seedRating: 4.8,
    memberSince: '2024-03-15T00:00:00.000Z',
  },
  {
    providerId: 'p-002',
    about:
      'Certified electrician working across Cape Town. Solar installs, DB boards, fault finding, and rewiring. Registered with the Department of Labour.',
    categories: ['Electrical'],
    completedJobs: 71,
    verified: true,
    seedRating: 4.9,
    memberSince: '2023-11-02T00:00:00.000Z',
  },
  {
    providerId: 'p-003',
    about:
      'Garden maintenance and landscaping. I handle everything from regular lawn care to full garden redesigns.',
    categories: ['Gardening', 'Landscaping'],
    completedJobs: 33,
    verified: false,
    seedRating: 4.5,
    memberSince: '2025-02-20T00:00:00.000Z',
  },
  {
    providerId: 'p-004',
    about:
      'Deep cleaning specialist for homes and small offices. Eco-friendly products, pet safe. Available for one-off and weekly bookings.',
    categories: ['Cleaning', 'Housekeeping'],
    completedJobs: 58,
    verified: true,
    seedRating: 4.7,
    memberSince: '2024-06-10T00:00:00.000Z',
  },
  {
    providerId: 'p-005',
    about:
      'Roofing and waterproofing specialist. Storm damage, leak repairs, tile replacements. Fully insured.',
    categories: ['Roofing', 'Waterproofing'],
    completedJobs: 24,
    verified: true,
    seedRating: 4.6,
    memberSince: '2024-09-05T00:00:00.000Z',
  },
  {
    providerId: 'p-006',
    about:
      'Painter with a focus on clean finishes and honest quotes. Interior and exterior work, colour consultation available.',
    categories: ['Painting'],
    completedJobs: 41,
    verified: true,
    seedRating: 4.8,
    memberSince: '2023-08-18T00:00:00.000Z',
  },
  {
    providerId: 'p-007',
    about:
      'Renovation specialist. Full bathroom, kitchen, and general home renovations. Project management included.',
    categories: ['Renovation', 'Building'],
    completedJobs: 19,
    verified: true,
    seedRating: 4.9,
    memberSince: '2024-01-22T00:00:00.000Z',
  },
  {
    providerId: 'p-008',
    about:
      'Fencing and building installations. Palisade, wooden, and wire fencing. Quotes within 24 hours.',
    categories: ['Building', 'Fencing'],
    completedJobs: 37,
    verified: true,
    seedRating: 4.7,
    memberSince: '2024-05-14T00:00:00.000Z',
  },
];

export const getDemoProviderProfile = (
  providerId: string
): DemoProviderProfile | undefined =>
  demoProviderProfiles.find((p) => p.providerId === providerId);
