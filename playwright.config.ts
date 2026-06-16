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
  timeout: 120 * 1000, // 120 second timeout per test
  globalTimeout: 600 * 1000, // 10 minute timeout for entire test run
  snapshotPathTemplate: '{dir}/__snapshots__/{testFileBaseName}-{testName}-{platform}{ext}',
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
    },
  },
  use: {
    baseURL: 'file://',
    trace: 'on-first-retry',
    navigationTimeout: 30000,
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Ensure consistent rendering
        locale: 'en-US',
        colorScheme: 'light',
      },
    },
  ],

  webServer: undefined, // Tests use local file:// URLs, no web server needed
})
