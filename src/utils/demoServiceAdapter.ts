// src/utils/demoServiceAdapter.ts
//
// Adapter that converts the Home-page demo services into the `Service`
// shape expected by service.service.ts. Used as a fallback when the
// backend is unreachable, so /services and /services/:id still work.

import type { Service, ServiceFilterOptions } from '../types/service.types';
import { demoServices, categories as demoCategories } from '../data/demoServices';

// ============================================
// SHAPE MAPPING
// ============================================

// Stable provider assignment — each demo service maps to one of our
// demo providers so the request flow has someone to talk to.
const PROVIDER_MAP: Record<string, { id: string; name: string }> = {
  '1': { id: 'p-001', name: 'Tom Brown' },
  '2': { id: 'p-002', name: 'Emily Davis' },
  '3': { id: 'p-003', name: 'Chris Miller' },
  '4': { id: 'p-004', name: 'Lisa Anderson' },
  '5': { id: 'p-005', name: 'Peter Zulu' },
  '6': { id: 'p-006', name: 'Sam Patel' },
  '7': { id: 'p-007', name: 'Andile Khumalo' },
  '8': { id: 'p-008', name: 'Grace Ndlovu' },
};

// Parse "From R250" into 250. Returns 0 if not parseable.
const parsePrice = (price?: string): number => {
  if (!price) return 0;
  const match = price.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

// Naive location — replace with real data when backend is ready
const LOCATION_MAP: Record<string, string> = {
  'Home Repair': 'Cape Town',
  'Construction': 'Johannesburg',
  'Outdoor': 'Durban',
  'Technology': 'Remote',
  'Engineering': 'Pretoria',
};

// Convert one demo service to the Service shape
const toService = (d: (typeof demoServices)[number]): Service => {
  const provider = PROVIDER_MAP[d.id] ?? { id: 'p-001', name: 'Tom Brown' };

  return {
    id: d.id,
    title: d.title,
    description: d.description,
    category: d.category,
    price: parsePrice(d.price),
    rating: d.rating ?? 0,
    location: LOCATION_MAP[d.category] ?? 'South Africa',
    skills: [d.category, d.title.split(' ')[0]],
    providerId: provider.id,
    provider_name: provider.name,
    estimatedDuration: 'Varies by job',
    status: 'active',
    color: d.color,
  } as unknown as Service;
};

// ============================================
// PUBLIC API
// ============================================

export const getDemoServicesAsServices = (): Service[] => {
  return demoServices.map(toService);
};

export const getDemoServiceById = (id: string): Service | undefined => {
  const found = demoServices.find((d) => d.id === id);
  return found ? toService(found) : undefined;
};

export const getDemoCategories = (): string[] => {
  // Exclude 'All' — that's a UI-only filter
  return demoCategories.filter((c) => c !== 'All');
};

// Apply the same filters the backend would apply
export const filterDemoServices = (
  filters?: ServiceFilterOptions
): Service[] => {
  let list = getDemoServicesAsServices();

  if (!filters) return list;

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    list = list.filter((s) => filters.categories!.includes(s.category));
  }

  // Search filter
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }

  // Location filter
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    list = list.filter((s) => s.location.toLowerCase().includes(loc));
  }

  // Price range
  if (filters.minPrice !== undefined) {
    list = list.filter((s) => (s.price ?? 0) >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    list = list.filter((s) => (s.price ?? 0) <= filters.maxPrice!);
  }

  // Sort
  switch (filters.sortBy) {
    case 'rating':
      list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case 'price_low':
      list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case 'price_high':
      list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case 'recent':
    default:
      // Keep source order for "recent"
      break;
  }

  return list;
};

// ============================================
// PROVIDER-STATS FALLBACK
// ============================================

// Provides demo stats for the provider dashboard when the backend is down.
export const getDemoProviderStats = () => {
  return {
    total: demoServices.length,
    active: 6,
    pending: 1,
    completed: 4,
  };
};

// The provider's own services when offline — for the demo we just show a
// couple of services they "own".
export const getDemoProviderServices = (providerId: string): Service[] => {
  return getDemoServicesAsServices().filter((s) => s.providerId === providerId);
};
