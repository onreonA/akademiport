/**
 * Storybook Test Runner Configuration
 *
 * Visual regression testing için Storybook test runner yapılandırması
 */

import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

const config: TestRunnerConfig = {
  setup() {
    // Test runner setup
  },
  async preVisit(page, context) {
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  },
  async postVisit(page, context) {
    // Run accessibility checks after each story
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  },
  // Only test stories tagged with 'visual'
  tags: {
    include: ['visual'],
    exclude: ['skip-visual', 'skip-test'],
  },
  // Visual regression testing settings
  getHttpHeaders: async () => {
    return {
      'Cache-Control': 'no-cache',
    };
  },
};

export default config;
