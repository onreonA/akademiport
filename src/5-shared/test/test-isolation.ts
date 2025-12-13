/**
 * Test Isolation Helpers
 *
 * Utilities to ensure proper test isolation and prevent test interference
 */

import { vi, beforeEach, afterEach } from 'vitest';
import { resetTestCookies } from './api-helpers';

/**
 * Setup test isolation for a test suite
 *
 * Call this in your describe block's beforeEach to ensure proper isolation
 */
export function setupTestIsolation() {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Reset test cookies
    resetTestCookies();

    // Clear all timers
    vi.clearAllTimers();
  });

  afterEach(() => {
    // Clear all mocks again
    vi.clearAllMocks();

    // Reset test cookies
    resetTestCookies();

    // Clear all timers
    vi.clearAllTimers();
  });
}

/**
 * Create a mock factory that resets properly
 */
export function createMockFactory<T extends (...args: any[]) => any>(factory: T): T {
  return ((...args: Parameters<T>) => {
    const mock = factory(...args);
    // Ensure mock is reset before each test
    if (typeof mock === 'object' && mock !== null) {
      if ('mockClear' in mock && typeof mock.mockClear === 'function') {
        beforeEach(() => {
          mock.mockClear();
        });
      }
      if ('mockReset' in mock && typeof mock.mockReset === 'function') {
        beforeEach(() => {
          mock.mockReset();
        });
      }
    }
    return mock;
  }) as T;
}

/**
 * Create isolated mock implementations
 * Prevents mock constructor issues
 */
export function createIsolatedMock<T extends object>(implementation: () => T): () => T {
  let instance: T | null = null;

  return () => {
    if (!instance) {
      instance = implementation();
    }
    return instance;
  };
}

