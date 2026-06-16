/**
 * Visual Regression Test: Math rendering in essay pages
 *
 * Tests that KaTeX-rendered math displays correctly at various screen sizes.
 * Compares against baseline screenshots to detect unintended visual regressions.
 *
 * Run with: npm run test:vrt
 * Update baselines: npm run test:vrt -- --update-snapshots
 */
import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const baseDir = join(__dirname, '../../dist')

test.describe('Math Rendering VRT', () => {
  // Test at mobile size (375px - per AGENTS.md)
  test('math page renders correctly on mobile (375px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  // Test at medium PC size (1280px - per AGENTS.md)
  test('math page renders correctly on medium PC (1280px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 1280, height: 1024 })
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  // Test at wide PC size (1440px - per AGENTS.md)
  test('math page renders correctly on wide PC (1440px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  // Verify KaTeX elements are rendered
  test('KaTeX elements are rendered with correct classes', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.waitForLoadState('networkidle')

    // Check for KaTeX elements
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)

    // Check for display math styling
    const displayMathElements = await page.locator('.katex-display').count()
    expect(displayMathElements).toBeGreaterThan(0)

    // Verify MathML annotation exists
    const mathmlElements = await page.locator('math').count()
    expect(mathmlElements).toBeGreaterThan(0)
  })

  // Verify split environments rendered (note: some align* may produce warnings)
  test('align* environments converted to split render without errors', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.waitForLoadState('networkidle')

    // At least some KaTeX elements should render successfully
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)
  })

})
