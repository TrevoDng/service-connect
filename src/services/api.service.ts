// src/services/api.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// Helper to get token from storage
const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper to extract data from response
const extractData = (response: any) => {
  if (response.success === true && response.data) {
    return response.data;
  }
  return response;
};

export const api = {
  get: async (endpoint: string, options?: RequestInit) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || data.error?.message || 'Request failed';
      throw new Error(errorMessage);
    }
    
    return extractData(data);
  },

  post: async (endpoint: string, body?: any, options?: RequestInit) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || data.error?.message || 'Request failed';
      throw new Error(errorMessage);
    }
    
    return extractData(data);
  },

  put: async (endpoint: string, body?: any, options?: RequestInit) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || data.error?.message || 'Request failed';
      throw new Error(errorMessage);
    }
    
    return extractData(data);
  },

  delete: async (endpoint: string, options?: RequestInit) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || data.error?.message || 'Request failed';
      throw new Error(errorMessage);
    }
    
    return extractData(data);
  },
};