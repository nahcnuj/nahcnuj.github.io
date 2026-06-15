/**
 * E2E Tests: Math rendering in essay pages
 *
 * Functional verification tests that check KaTeX elements render correctly.
 * Tests are platform-agnostic and run on Linux CI.
 *
 * Platform: Linux
 * Run with: npm run test:e2e
 */

import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const baseDir = join(__dirname, '../../dist')

test.describe('Math Rendering E2E', () => {
  // Verify KaTeX elements are rendered on mobile
  test('math page renders KaTeX on mobile (375px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForLoadState('networkidle')

    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)
  })

  // Verify KaTeX elements are rendered on medium screen
  test('math page renders KaTeX on medium PC (1280px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 1280, height: 1024 })
    await page.waitForLoadState('networkidle')

    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)
  })

  // Verify KaTeX elements are rendered on wide screen
  test('math page renders KaTeX on wide PC (1440px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForLoadState('networkidle')

    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)
  })

  // Verify KaTeX elements are rendered with correct classes
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

  // Verify math renders without errors
  test('math content renders without KaTeX errors', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.waitForLoadState('networkidle')

    // Check that there are KaTeX elements
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)

    // Verify no error elements are present
    const errorElements = await page.locator('.katex-error').count()
    expect(errorElements).toBe(0)
  })
})
