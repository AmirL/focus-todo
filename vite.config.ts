import { defineConfig, defaultExclude } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    exclude: [...defaultExclude, '.claude/**'],
    coverage: {
      provider: 'istanbul',
      reporter: ['json', 'text-summary'],
      reportsDirectory: './coverage/unit',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['**/*.spec.ts', '**/*.test.ts', 'cypress/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
