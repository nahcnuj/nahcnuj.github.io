import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for VRT (Visual Regression Tests)
 * Captures screenshots at multiple screen sizes per AGENTS.md guidelines
 * Platform: Windows only (platform-specific font rendering)
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.vrt.test.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'file://',
    trace: 'on-first-retry',
  },
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-{platform}{ext}',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: undefined, // Tests use local file:// URLs, no web server needed
})
