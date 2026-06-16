/**
 * Visual Regression Test: Math rendering in essay pages
 *
 * Tests that KaTeX-rendered math displays correctly at various screen sizes.
 * Compares against baseline screenshots to detect unintended visual regressions.
 *
 * Platform: Windows only (platform-specific font rendering)
 * Run with: npm run test:vrt
 * Update baselines: npm run test:vrt -- --update-snapshots
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const baseDir = join(__dirname, '../../dist')

test.describe('Math Rendering VRT', () => {
  // Test at mobile size (375px - per AGENTS.md)
  test('math page renders correctly on mobile (375px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('math-page-mobile-375.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  // Test at medium PC size (1280px - per AGENTS.md)
  test('math page renders correctly on medium PC (1280px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 1280, height: 1024 })
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('math-page-medium-1280.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  // Test at wide PC size (1440px - per AGENTS.md)
  test('math page renders correctly on wide PC (1440px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('math-page-wide-1440.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })
})
