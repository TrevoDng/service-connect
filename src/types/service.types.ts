// src/types/service.types.ts

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  availability?: string;
  estimatedDuration?: string;
  skills: string[];
  provider_id: string;
  provider_name?: string;
  provider_email?: string;
  status: 'active' | 'inactive' | 'pending';
  bookings_count?: number;
  rating?: number;
  created_at: string;
  updated_at?: string;
}

export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  location: string;
  availability: string;
  estimatedDuration: string;
  skills: string[];
}

export interface ServiceStats {
  total: number;
  active: number;
  pending: number;
  completed: number;
}

export interface ServiceFilterOptions {
  searchQuery?: string;
  categories?: string[];
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'recent' | 'rating' | 'price_low' | 'price_high';
}