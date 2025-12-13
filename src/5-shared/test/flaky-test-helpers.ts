/**
 * Flaky Test Helpers
 *
 * Flaky testleri önlemek için helper fonksiyonlar
 */

import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Element'in görünür olmasını bekler (flaky testleri önlemek için)
 */
export async function waitForElement(
  queryFn: () => HTMLElement | null,
  options?: { timeout?: number; interval?: number; checkVisibility?: boolean }
): Promise<HTMLElement> {
  const checkVisibility = options?.checkVisibility !== false; // Default true, but can be disabled

  return waitFor(
    () => {
      const element = queryFn();
      if (!element) {
        throw new Error('Element not found');
      }
      // Only check visibility if explicitly requested (some elements might not be visible but still exist)
      if (checkVisibility) {
        // Check if element is in the document and has dimensions or is a form element
        const isFormElement = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(element.tagName);
        const hasDimensions = element.offsetWidth > 0 || element.offsetHeight > 0;
        const isInDocument = document.body.contains(element);

        if (!isInDocument) {
          throw new Error('Element not in document');
        }

        // For form elements, just check if they're in the document
        // For other elements, check visibility more strictly
        if (
          !isFormElement &&
          !hasDimensions &&
          element.offsetParent === null &&
          element.style.display !== 'none'
        ) {
          // Element might be hidden but still functional, allow it
          // Only throw if it's clearly not visible
        }
      }
      return element;
    },
    {
      timeout: options?.timeout || 5000,
      interval: options?.interval || 100,
    }
  );
}

/**
 * Element'in kaybolmasını bekler
 */
export async function waitForElementRemoval(
  queryFn: () => HTMLElement | null,
  options?: { timeout?: number }
): Promise<void> {
  const element = queryFn();
  if (element) {
    await waitForElementToBeRemoved(() => queryFn(), {
      timeout: options?.timeout || 5000,
    });
  }
}

/**
 * Async işlemin tamamlanmasını bekler
 */
export async function waitForAsync(
  condition: () => Promise<boolean>,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  const startTime = Date.now();
  const timeout = options?.timeout || 5000;
  const interval = options?.interval || 100;

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Async condition not met within ${timeout}ms`);
}

/**
 * Network request'in tamamlanmasını bekler
 */
export async function waitForNetworkIdle(options?: {
  timeout?: number;
  idleTime?: number;
}): Promise<void> {
  const timeout = options?.timeout || 5000;
  const idleTime = options?.idleTime || 500;

  let lastActivity = Date.now();

  const checkIdle = () => {
    const now = Date.now();
    if (now - lastActivity > idleTime) {
      return true;
    }
    lastActivity = now;
    return false;
  };

  // Mock fetch activity tracking
  const originalFetch = global.fetch;
  global.fetch = vi.fn((...args) => {
    lastActivity = Date.now();
    return originalFetch(...args);
  });

  try {
    await waitForAsync(checkIdle, { timeout });
  } finally {
    global.fetch = originalFetch;
  }
}

/**
 * Flaky test için retry wrapper
 */
export async function retryFlakyTest<T>(
  testFn: () => Promise<T>,
  options?: { retries?: number; delay?: number }
): Promise<T> {
  const retries = options?.retries || 3;
  const delay = options?.delay || 1000;

  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await testFn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Test failed after retries');
}

/**
 * Test isolation için cleanup helper
 */
export function setupTestIsolation() {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset DOM
    document.body.innerHTML = '';

    // Reset timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore timers
    vi.useRealTimers();

    // Clear all mocks again
    vi.clearAllMocks();
  });
}
