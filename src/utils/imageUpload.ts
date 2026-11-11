// src/utils/imageUpload.ts
import { getToken } from '../account/context/AuthContext';

// ============================================
// VALIDATION & COMPRESSION (Unchanged)
// ============================================

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per file

export const validateImage = (file: File): { ok: boolean; reason?: string } => {
  if (!VALID_TYPES.includes(file.type)) {
    // Change the error message here:
    return { ok: false, reason: 'Only JPEG, PNG, WebP, or PDF files are allowed.' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    // Update this too for clarity:
    return { ok: false, reason: 'File is larger than 10 MB.' };
  }
  return { ok: true };
};

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

export const compressImage = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) return file;

  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return resolve(file);

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const longest = Math.max(width, height);
        if (longest > MAX_DIMENSION) {
          const ratio = MAX_DIMENSION / longest;
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressed = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '') + '.jpg',
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            resolve(compressed);
          },
          'image/jpeg',
          JPEG_QUALITY
        );
      };
      img.onerror = () => resolve(file);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

// ============================================
// UPLOAD TO BACKEND
// ============================================

export type UploadEntityType =
  | 'bookings'
  | 'disputes'
  | 'worksessions'
  | 'reviews'
  | 'chats'
  | 'registrations'
  | 'support';

export interface UploadContext {
  entityType: UploadEntityType;
  entityId: string;
  category:
    | 'request' | 'consultation' | 'evidence' | 'before'
    | 'progress' | 'final' | 'review' | 'attachments' | 'documents';
}

/**
 * Uploads a single image to the backend, returning the full URL.
 */
export const uploadImage = async (file: File, context: UploadContext): Promise<string> => {
  const token = getToken();
  
  // Only require token if it's NOT a registration
  if (context.entityType !== 'registrations' && !token) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('entityType', context.entityType);
  formData.append('entityId', context.entityId);
  formData.append('category', context.category);
  formData.append('file', file);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const BACKEND_ORIGIN = API_BASE_URL.replace('/api', '');

  // Choose route based on entityType
  const isRegistration = context.entityType === 'registrations';
  const endpoint = isRegistration ? `${API_BASE_URL}/upload/public` : `${API_BASE_URL}/upload`;

  const headers: HeadersInit = {};
  if (token && !isRegistration) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Upload failed');
  }

  return `${BACKEND_ORIGIN}${data.data.url}`;
};

// ============================================
// BATCH HELPER
// ============================================

/**
 * Runs an array of files through validate → compress → upload.
 * Skips files that fail validation.
 */
export const processImageBatch = async (
  files: File[],
  context: UploadContext
): Promise<{ urls: string[]; rejected: string[] }> => {
  const urls: string[] = [];
  const rejected: string[] = [];

  for (const file of files) {
    const check = validateImage(file);
    if (!check.ok) {
      rejected.push(`${file.name}: ${check.reason}`);
      continue;
    }
    try {
      const compressed = await compressImage(file);
      const url = await uploadImage(compressed, context);
      urls.push(url);
    } catch (err: any) {
      rejected.push(`${file.name}: ${err.message || 'Upload failed'}`);
    }
  }

  return { urls, rejected };
};