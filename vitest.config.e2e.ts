import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    // Run E2E test files serially to avoid port conflicts between dev-server instances
    fileParallelism: false,
  },
})
