/**
 * CSRF Token Hook
 *
 * Client-side CSRF token yönetimi için React hook
 */

import { useEffect, useState } from 'react';

/**
 * Get CSRF token from cookie
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find((cookie) => cookie.trim().startsWith('csrf-token='));

  if (!csrfCookie) {
    return null;
  }

  return csrfCookie.split('=')[1]?.trim() || null;
}

/**
 * React hook for CSRF token
 */
export function useCsrfToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from cookie
    const tokenFromCookie = getCsrfTokenFromCookie();
    setToken(tokenFromCookie);

    // Listen for cookie changes (in case token is refreshed)
    const interval = setInterval(() => {
      const newToken = getCsrfTokenFromCookie();
      if (newToken !== token) {
        setToken(newToken);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return token;
}

/**
 * Get CSRF token synchronously (for use outside React components)
 */
export function getCsrfToken(): string | null {
  return getCsrfTokenFromCookie();
}
