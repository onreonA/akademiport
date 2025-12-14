/**
 * Fetch with CSRF Token
 *
 * CSRF token'ı otomatik olarak ekleyen fetch wrapper
 */

import { getCsrfToken } from '../hooks/useCsrfToken';

export interface FetchWithCsrfOptions extends RequestInit {
  skipCsrf?: boolean; // Skip CSRF for public endpoints
}

/**
 * Fetch wrapper that automatically adds CSRF token
 */
export async function fetchWithCsrf(
  url: string,
  options: FetchWithCsrfOptions = {}
): Promise<Response> {
  const { skipCsrf, ...fetchOptions } = options;

  // Add CSRF token for state-changing methods
  if (!skipCsrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(fetchOptions.method || 'GET')) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'x-csrf-token': csrfToken,
      };
    }
  }

  return fetch(url, fetchOptions);
}
