import { defineConfig, devices } from '@playwright/test'

const DEV_PORT = 5173

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.vrt.test.ts',
  fullyParallel: false,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
    },
  },
  use: {
    baseURL: `http://localhost:${DEV_PORT}`,
    ...devices['Desktop Chrome'],
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: `npm run dev -- --port ${DEV_PORT} --strictPort`,
    url: `http://localhost:${DEV_PORT}`,
    // Vitest E2E may leave `npm run dev` on this port; reuse it when available.
    reuseExistingServer: true,
    timeout: 120_000,
  },
})