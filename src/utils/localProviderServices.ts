// src/utils/localProviderServices.ts
//
// localStorage-backed persistence for services a provider creates or
// deletes while the backend is unreachable. Swapped for real API calls
// when the backend is stable.

import type { Service, ServiceFormData } from '../types/service.types';
import { generateId } from './referenceCode';

const STORAGE_KEY = 'serviceconnect-provider-services';

// ============================================
// READ
// ============================================

export const getLocalProviderServices = (): Service[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Service[]) : [];
  } catch (err) {
    console.error('Failed to read local provider services:', err);
    return [];
  }
};

export const getLocalProviderServicesByProvider = (
  providerId: string
): Service[] => {
  return getLocalProviderServices().filter((s) => s.providerId === providerId);
};

// ============================================
// WRITE
// ============================================

const writeAll = (list: Service[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to write local provider services:', err);
  }
};

export const addLocalProviderService = (
  data: ServiceFormData,
  providerId: string
): Service => {
  const now = new Date().toISOString();
  const newService: Service = {
    id: generateId(),
    title: data.title,
    description: data.description,
    category: data.category,
    price: parseFloat(String(data.price)) || 0,
    rating: 0,
    location: data.location,
    skills: data.skills ?? [],
    providerId,
    provider_name: '',
    estimatedDuration: data.estimatedDuration || 'Varies',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  } as unknown as Service;

  const current = getLocalProviderServices();
  writeAll([newService, ...current]);
  return newService;
};

export const deleteLocalProviderService = (serviceId: string): void => {
  const current = getLocalProviderServices();
  writeAll(current.filter((s) => s.id !== serviceId));
};

export const clearLocalProviderServices = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear local provider services:', err);
  }
};
