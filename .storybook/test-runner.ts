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
  async preVisit(page) {
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
  tags: {
    include: ['visual'],
    exclude: ['skip-visual'],
  },
};

export default config;
