// src/services/service.service.ts
import { api } from './api.service';
import type {
  Service,
  ServiceFormData,
  ServiceStats,
  ServiceFilterOptions,
} from '../types/service.types';

export const serviceService = {
  // ==========================================
  // FOR SERVICE PROVIDERS
  // ==========================================

  getProviderServices: async (): Promise<Service[]> => {
    const res = await api.get<{ services: Service[] }>('/provider/services');
    return res.services;
  },

  getProviderStats: async (): Promise<ServiceStats> => {
    return api.get<ServiceStats>('/provider/services/stats');
  },

  createService: async (data: ServiceFormData): Promise<Service> => {
    const res = await api.post<{ service: Service }>('/services', {
      ...data,
      price: parseFloat(data.price) || 0,
      status: 'active',
    });
    return res.service;
  },

  updateService: async (
    serviceId: string,
    data: Partial<ServiceFormData>
  ): Promise<Service> => {
    return api.put<Service>(`/services/${serviceId}`, data);
  },

  updateServiceStatus: async (
    serviceId: string,
    status: 'active' | 'inactive'
  ): Promise<Service> => {
    return api.put<Service>(`/services/${serviceId}/status`, { status });
  },

  deleteService: async (serviceId: string): Promise<void> => {
    return api.delete<void>(`/services/${serviceId}`);
  },

  // ==========================================
  // FOR CLIENTS
  // ==========================================

  getServices: async (filters?: ServiceFilterOptions): Promise<Service[]> => {
    const queryParams = new URLSearchParams();

    if (filters?.searchQuery) queryParams.append('search', filters.searchQuery);
    if (filters?.categories?.length) queryParams.append('categories', filters.categories.join(','));
    if (filters?.location) queryParams.append('location', filters.location);
    if (filters?.minPrice !== undefined) queryParams.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) queryParams.append('maxPrice', String(filters.maxPrice));
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);

    const url = `/services${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const res = await api.get<{ services: Service[] }>(url);
    return res.services;
  },

  getServiceById: async (serviceId: string): Promise<Service> => {
    const res = await api.get<{ service: Service }>(`/services/${serviceId}`);
    return res.service;
  },

  getServicesByCategory: async (category: string): Promise<Service[]> => {
    return api.get<Service[]>(`/services/category/${category}`);
  },

  getCategories: async (): Promise<string[]> => {
    return api.get<string[]>('/services/categories');
  },

  searchServices: async (query: string): Promise<Service[]> => {
    return api.get<Service[]>(`/services/search?q=${encodeURIComponent(query)}`);
  },

  requestService: async (
    serviceId: string,
    data: { bookingDate: string; notes?: string }
  ): Promise<any> => {
    return api.post<any>(`/services/${serviceId}/book`, data);
  },

  getMyBookings: async (): Promise<any[]> => {
    return api.get<any[]>('/bookings');
  },
};