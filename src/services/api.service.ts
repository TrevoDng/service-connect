// src/services/api.service.ts

const API_BASE_URL =
  import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

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

// Shared request runner — keeps the four methods DRY
async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
    body:
      body !== undefined && method !== 'GET' && method !== 'DELETE'
        ? JSON.stringify(body)
        : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data.message || data.error?.message || 'Request failed';
    throw new Error(errorMessage);
  }

  return extractData(data) as T;
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestInit): Promise<T> =>
    request<T>('GET', endpoint, undefined, options),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> => request<T>('POST', endpoint, body, options),

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> => request<T>('PUT', endpoint, body, options),

  delete: <T = unknown>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => request<T>('DELETE', endpoint, undefined, options),
};
