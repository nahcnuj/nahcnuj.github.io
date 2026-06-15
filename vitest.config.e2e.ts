import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.e2e.test.ts'],
    // Run E2E test files serially to avoid port conflicts between dev-server instances
    fileParallelism: false,
    testTimeout: 30000, // Increase timeout for browser operations
  },
})
