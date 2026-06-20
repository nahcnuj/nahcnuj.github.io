import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.test.ts'],
    exclude: ['tests/e2e/**/*.vrt.test.ts'],
    // Run E2E test files serially to avoid port conflicts between dev-server instances
    fileParallelism: false,
  },
})
