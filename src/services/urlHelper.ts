/**
 * The simplest version - just adds /service-connect if needed
 */
export function goTo(path: string): string {
  const base = window.location.pathname.startsWith('/service-connect') 
    ? '/service-connect' 
    : '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

// Usage in components:
// <Link to={goTo('/login')}>Login</Link>
// navigate(goTo('/dashboard'))
