// src/services/service.service.ts
//
// Every method tries the backend first, then falls back to demo data if
// the request fails (backend down, network error, timeout, 5xx, etc.).
//
// Public API is unchanged — no component needs updating.

import { api } from './api.service';
import type {
  Service,
  ServiceFormData,
  ServiceStats,
  ServiceFilterOptions,
} from '../types/service.types';
import {
  filterDemoServices,
  getDemoServiceById,
  getDemoCategories,
  getDemoProviderStats,
  getDemoProviderServices,
} from '../utils/demoServiceAdapter';
import {
  getLocalProviderServicesByProvider,
  addLocalProviderService,
  deleteLocalProviderService,
} from '../utils/localProviderServices';

// ============================================
// FALLBACK WRAPPER
// ============================================
//
// Runs `backendCall`. On any failure, returns `fallback()`.
// Logs a soft warning so devs can see it's in offline mode.

async function withFallback<T>(
  label: string,
  backendCall: () => Promise<T>,
  fallback: () => T
): Promise<T> {
  try {
    return await backendCall();
  } catch (err) {
    console.warn(
      `[service.service] Backend unreachable for "${label}". Using demo data.`,
      err instanceof Error ? err.message : err
    );
    return fallback();
  }
}

// ============================================
// SERVICE OBJECT
// ============================================

export const serviceService = {
  // ==========================================
  // FOR SERVICE PROVIDERS
  // ==========================================

  // Get all services for the current provider
  getProviderServices: async (): Promise<Service[]> => {
    return withFallback(
      'getProviderServices',
      () => api.get<Service[]>('/provider/services'),
      () => {
        // Merge demo provider services with any local ones (offline-created)
        const demo = getDemoProviderServices('p-001');
        const local = getLocalProviderServicesByProvider('p-001');
        return [...local, ...demo];
      }
    );
  },

  // Get service stats for the current provider
  getProviderStats: async (): Promise<ServiceStats> => {
    return withFallback(
      'getProviderStats',
      () => api.get<ServiceStats>('/provider/services/stats'),
      () => {
        const demo = getDemoProviderStats();
        const local = getLocalProviderServicesByProvider('p-001');
        return {
          total: demo.total + local.length,
          active: demo.active + local.filter((s) => s.status === 'active').length,
          pending: demo.pending,
          completed: demo.completed,
        };
      }
    );
  },

  // Add a new service
  createService: async (data: ServiceFormData): Promise<Service> => {
    return withFallback(
      'createService',
      () =>
        api.post<Service>('/services', {
          ...data,
          price: parseFloat(data.price) || 0,
          status: 'active',
        }),
      () => addLocalProviderService(data, 'p-001')
    );
  },

  // Update a service
  updateService: async (
    serviceId: string,
    data: Partial<ServiceFormData>
  ): Promise<Service> => {
    return withFallback(
      'updateService',
      () => api.put<Service>(`/services/${serviceId}`, data),
      () => {
        // Offline: return the merged shape (best-effort)
        const existing =
          getDemoServiceById(serviceId) ??
          getLocalProviderServicesByProvider('p-001').find(
            (s) => s.id === serviceId
          );
        return { ...(existing as Service), ...data } as Service;
      }
    );
  },

  // Update service status
  updateServiceStatus: async (
    serviceId: string,
    status: 'active' | 'inactive'
  ): Promise<Service> => {
    return withFallback(
      'updateServiceStatus',
      () => api.put<Service>(`/services/${serviceId}/status`, { status }),
      () => {
        const existing =
          getDemoServiceById(serviceId) ??
          getLocalProviderServicesByProvider('p-001').find(
            (s) => s.id === serviceId
          );
        return { ...(existing as Service), status } as Service;
      }
    );
  },

  // Delete a service
  deleteService: async (serviceId: string): Promise<void> => {
    return withFallback(
      'deleteService',
      () => api.delete<void>(`/services/${serviceId}`),
      () => {
        // Offline: remove from local store if present. Demo data is read-only.
        deleteLocalProviderService(serviceId);
      }
    );
  },

  // ==========================================
  // FOR CLIENTS
  // ==========================================

  // Get all active services (with optional filters)
  getServices: async (
    filters?: ServiceFilterOptions
  ): Promise<Service[]> => {
    const queryParams = new URLSearchParams();

    if (filters?.searchQuery) queryParams.append('search', filters.searchQuery);
    if (filters?.categories?.length)
      queryParams.append('categories', filters.categories.join(','));
    if (filters?.location) queryParams.append('location', filters.location);
    if (filters?.minPrice !== undefined)
      queryParams.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined)
      queryParams.append('maxPrice', String(filters.maxPrice));
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);

    const url = `/services${
      queryParams.toString() ? '?' + queryParams.toString() : ''
    }`;

    return withFallback(
      'getServices',
      () => api.get<Service[]>(url),
      () => filterDemoServices(filters)
    );
  },

  // Get a single service by ID
  getServiceById: async (serviceId: string): Promise<Service> => {
    return withFallback(
      'getServiceById',
      () => api.get<Service>(`/services/${serviceId}`),
      () => {
        const found = getDemoServiceById(serviceId);
        if (!found) {
          throw new Error('Service not found');
        }
        return found;
      }
    );
  },

  // Get services by category
  getServicesByCategory: async (category: string): Promise<Service[]> => {
    return withFallback(
      'getServicesByCategory',
      () => api.get<Service[]>(`/services/category/${category}`),
      () => filterDemoServices({ categories: [category] })
    );
  },

  // Get all available categories
  getCategories: async (): Promise<string[]> => {
    return withFallback(
      'getCategories',
      () => api.get<string[]>('/services/categories'),
      () => getDemoCategories()
    );
  },

  // Search services
  searchServices: async (query: string): Promise<Service[]> => {
    return withFallback(
      'searchServices',
      () => api.get<Service[]>(`/services/search?q=${encodeURIComponent(query)}`),
      () => filterDemoServices({ searchQuery: query })
    );
  },

  // ==========================================
  // BOOKING (for clients)
  // ==========================================

  // Request a service (creates a booking).
  // When the backend is down we do nothing here — the client's
  // BookingRequestForm writes to localStorage itself.
  requestService: async (
    serviceId: string,
    data: { bookingDate: string; notes?: string }
  ): Promise<any> => {
    return withFallback(
      'requestService',
      () => api.post<any>(`/services/${serviceId}/book`, data),
      () => {
        // Offline: return a synthetic acknowledgement so the UI moves on.
        return {
          success: true,
          offline: true,
          message: 'Request stored locally (backend unreachable).',
        };
      }
    );
  },

  // Get bookings for the current user
  getMyBookings: async (): Promise<any[]> => {
    return withFallback(
      'getMyBookings',
      () => api.get<any[]>('/bookings'),
      () => []
    );
  },
};
