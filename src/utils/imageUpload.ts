export const uploadImage = async (file: File): Promise<string> => {
  // Placeholder for image upload logic
  console.log('Uploading image:', file.name);
  return URL.createObjectURL(file);
};

export const validateImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  return validTypes.includes(file.type) && file.size <= maxSize;
};
