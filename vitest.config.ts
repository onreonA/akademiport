import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tsconfigPaths()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/5-shared/test/setup.ts'],
      env,
      // Parallelization settings
      threads: !process.env.CI, // Disable threads in CI for better stability
      maxWorkers: process.env.CI ? 1 : undefined, // Use single worker in CI
      minWorkers: 1,
      // Performance optimizations
      isolate: true, // Isolate each test file (better performance)
      // Test timeout
      testTimeout: 10000,
      hookTimeout: 10000,
      // Retry flaky tests (only in CI)
      retry: process.env.CI ? 2 : 0,
      // Flaky test detection
      bail: 0, // Don't bail on first failure
      // Coverage settings
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/5-shared/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockData',
          '**/*.stories.*',
          '.storybook/',
        ],
        thresholds: {
          lines: 60,
          functions: 60,
          branches: 60,
          statements: 60,
        },
      },
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: [
        'node_modules',
        'dist',
        '.next',
        'out',
        '.storybook',
        'e2e/**', // E2E testleri Playwright ile çalışır, Vitest ile değil
        '**/*.e2e.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
      // Reporter settings
      reporters: process.env.CI ? ['verbose', 'json', 'junit'] : ['verbose', 'json'],
      outputFile: {
        json: './test-results/results.json',
        junit: './test-results/junit.xml',
      },
    },
    resolve: {
      alias: {
        '@/presentation': path.resolve(__dirname, './src/1-presentation'),
        '@/application': path.resolve(__dirname, './src/2-application'),
        '@/domain': path.resolve(__dirname, './src/3-domain'),
        '@/infrastructure': path.resolve(__dirname, './src/4-infrastructure'),
        '@/shared': path.resolve(__dirname, './src/5-shared'),
        '@/core': path.resolve(__dirname, './src/6-core'),
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
