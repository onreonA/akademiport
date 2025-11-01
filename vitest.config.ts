import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/5-shared/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/5-shared/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.stories.*',
        '.storybook/',
      ],
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'out', '.storybook'],
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
});
