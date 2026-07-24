/**
 * Get the correct URL path for GitHub Pages deployment
 * Handles the base URL when deployed to GitHub Pages with project name
 */
export function getUrl(path: string = ''): string {
  // Check if we're in production (GitHub Pages)
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Base URL for GitHub Pages
  const baseUrl = '/service-connect';
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production, prepend base URL, otherwise just use the path
  const url = isProduction ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
  
  // Remove trailing slash if path is empty
  return url.replace(/\/$/, '') || (isProduction ? baseUrl : '/');
}

/**
 * Helper to get full URL including domain
 */
export function getFullUrl(path: string = ''): string {
  const base = process.env.NODE_ENV === 'production' 
    ? 'https://TrevoDng.github.io' 
    : 'http://localhost:3000';
  
  return `${base}${getUrl(path)}`;
}

/**
 * Check if current path matches a given path
 */
export function isActivePath(currentPath: string, targetPath: string): boolean {
  const normalizedCurrent = currentPath.replace(/^\/service-connect/, '');
  const normalizedTarget = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  return normalizedCurrent === normalizedTarget || 
         normalizedCurrent === `${normalizedTarget}/`;
}

export default getUrl;
