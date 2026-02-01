import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setupTests.ts',
    isolate: true,
    include: ['tests/**/*.test.tsx', 'tests/**/*.spec.ts', 'tests/**/*.spec.tsx', 'tests/integration/**'],
    deps: {
      inline: ['msw']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
});
