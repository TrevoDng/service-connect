// src/services/service.service.ts
import { api } from './api.service';
import { Service, ServiceFormData, ServiceStats, ServiceFilterOptions } from '../types/service.types';

export const serviceService = {
  // === For Service Providers ===
  
  // Get all services for the current provider
  getProviderServices: async (): Promise<Service[]> => {
    return api.get('/provider/services');
  },

  // Get service stats for the current provider
  getProviderStats: async (): Promise<ServiceStats> => {
    return api.get('/provider/services/stats');
  },

  // Add a new service
  createService: async (data: ServiceFormData): Promise<Service> => {
    return api.post('/services', {
      ...data,
      price: parseFloat(data.price) || 0,
      status: 'active'
    });
  },

  // Update a service
  updateService: async (serviceId: string, data: Partial<ServiceFormData>): Promise<Service> => {
    return api.put(`/services/${serviceId}`, data);
  },

  // Update service status (active/inactive)
  updateServiceStatus: async (serviceId: string, status: 'active' | 'inactive'): Promise<Service> => {
    return api.put(`/services/${serviceId}/status`, { status });
  },

  // Delete a service
  deleteService: async (serviceId: string): Promise<void> => {
    return api.delete(`/services/${serviceId}`);
  },

  // === For Clients ===
  
  // Get all active services (with optional filters)
  getServices: async (filters?: ServiceFilterOptions): Promise<Service[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.searchQuery) {
      queryParams.append('search', filters.searchQuery);
    }
    if (filters?.categories && filters.categories.length > 0) {
      queryParams.append('categories', filters.categories.join(','));
    }
    if (filters?.location) {
      queryParams.append('location', filters.location);
    }
    if (filters?.minPrice !== undefined) {
      queryParams.append('minPrice', filters.minPrice.toString());
    }
    if (filters?.maxPrice !== undefined) {
      queryParams.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters?.sortBy) {
      queryParams.append('sortBy', filters.sortBy);
    }
    
    const url = `/services${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return api.get(url);
  },

  // Get a single service by ID
  getServiceById: async (serviceId: string): Promise<Service> => {
    return api.get(`/services/${serviceId}`);
  },

  // Get services by category
  getServicesByCategory: async (category: string): Promise<Service[]> => {
    return api.get(`/services/category/${category}`);
  },

  // Get all available categories
  getCategories: async (): Promise<string[]> => {
    return api.get('/services/categories');
  },

  // Search services
  searchServices: async (query: string): Promise<Service[]> => {
    return api.get(`/services/search?q=${encodeURIComponent(query)}`);
  },

  // === Booking Related (for clients) ===
  
  // Request a service (create booking)
  requestService: async (serviceId: string, data: { 
    bookingDate: string; 
    notes?: string;
  }): Promise<any> => {
    return api.post(`/services/${serviceId}/book`, data);
  },

  // Get bookings for the current user
  getMyBookings: async (): Promise<any[]> => {
    return api.get('/bookings');
  },
};