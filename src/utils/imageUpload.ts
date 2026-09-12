// src/utils/imageUpload.ts
// Client-side helpers for image handling.
// - validateImage: type + size guard
// - compressImage: downscale + re-encode to keep memory reasonable
// - uploadImage: placeholder that returns a blob URL (swap for a real upload later)

// ============================================
// VALIDATION
// ============================================

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per file

export const validateImage = (file: File): { ok: boolean; reason?: string } => {
  if (!VALID_TYPES.includes(file.type)) {
    return { ok: false, reason: 'Only JPEG, PNG, or WebP images are allowed.' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, reason: 'Image is larger than 10 MB.' };
  }
  return { ok: true };
};

// ============================================
// COMPRESSION
// ============================================

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

/**
 * Downscales an image to at most MAX_DIMENSION on the longest edge and
 * returns a compressed JPEG File. GIFs and animated images should be
 * skipped (they will be flattened). For our use case (before/progress/final
 * photos) that's fine.
 */
export const compressImage = async (file: File): Promise<File> => {
  // Non-raster types bypass compression
  if (!file.type.startsWith('image/')) return file;

  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return resolve(file);

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Compute scaled dimensions
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
// UPLOAD (PLACEHOLDER)
// ============================================

/**
 * Currently returns a local blob URL. When a real backend exists, replace
 * the body of this function with a fetch/FormData call.
 */
export const uploadImage = async (file: File): Promise<string> => {
  return URL.createObjectURL(file);
};

// ============================================
// BATCH HELPER
// ============================================

/**
 * Runs an array of files through validate → compress → upload and returns
 * the resulting URLs. Skips files that fail validation.
 */
export const processImageBatch = async (
  files: File[]
): Promise<{ urls: string[]; rejected: string[] }> => {
  const urls: string[] = [];
  const rejected: string[] = [];

  for (const file of files) {
    const check = validateImage(file);
    if (!check.ok) {
      rejected.push(`${file.name}: ${check.reason}`);
      continue;
    }
    const compressed = await compressImage(file);
    const url = await uploadImage(compressed);
    urls.push(url);
  }

  return { urls, rejected };
};
