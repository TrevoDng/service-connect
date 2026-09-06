/**
 * URL helper for use with Router basename
 * Router automatically adds /service-connect
 * So we only return the clean path
 */
export function getUrl(path: string = '', currentUrl?: string): [string, string?] {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If path is empty, return '/'
  if (!cleanPath) {
    return ['/', currentUrl];
  }

  const finalPath = `/${cleanPath}`
  //console.log({finalPath, currentUrl});
  // Return the clean path - Router adds the basename
  return [finalPath, currentUrl];
}

/**
 * Get the current base path (for debugging/info)
 */
export function getBasePath(): string {
  return '/service-connect';
}

/**
 * Check if we're on a service-connect path
 */
export function isServiceConnectBase(): boolean {
  return window.location.pathname.includes('/service-connect');
}

/**
 * Get full URL including domain and basename (for external links)
 */
export function getFullUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = '/service-connect';
  return cleanPath ? `${base}/${cleanPath}` : base;
}

export default getUrl;
