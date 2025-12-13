/**
 * Storybook Test Runner Setup
 *
 * Global setup for visual regression tests
 */

import { beforeAll, afterAll } from '@storybook/test-runner';

beforeAll(async () => {
  // Setup before all tests
  console.log('🧪 Storybook Test Runner: Starting visual regression tests...');
});

afterAll(async () => {
  // Cleanup after all tests
  console.log('✅ Storybook Test Runner: Visual regression tests completed');
});
