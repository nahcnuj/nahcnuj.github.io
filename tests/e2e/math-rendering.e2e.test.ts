/**
 * E2E Tests: Math rendering in essay pages
 *
 * Functional verification tests that check KaTeX elements render correctly.
 * Tests are platform-agnostic and run on Linux CI with Vitest.
 *
 * Platform: Linux
 * Run with: npm run test:e2e
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import type { Browser } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const baseDir = join(__dirname, '../../dist')

describe('Math Rendering E2E', () => {
  let browser: Browser | null = null

  beforeAll(async () => {
    browser = await chromium.launch()
  })

  // Verify KaTeX elements are rendered on mobile
  it('math page renders KaTeX on mobile (375px)', async () => {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.waitForLoadState('networkidle')

    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)

    await page.close()
  })

  // Verify KaTeX elements are rendered on medium screen
  it('math page renders KaTeX on medium PC (1280px)', async () => {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1280, height: 1024 })
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.waitForLoadState('networkidle')

    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)

    await page.close()
  })

  // Verify KaTeX elements are rendered on wide screen
  it('math page renders KaTeX on wide PC (1440px)', async () => {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.waitForLoadState('networkidle')

    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)

    await page.close()
  })

  // Verify KaTeX elements are rendered with correct classes
  it('KaTeX elements are rendered with correct classes', async () => {
    const page = await browser.newPage()
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

    await page.close()
  })

  // Verify math renders without errors
  it('math content renders without KaTeX errors', async () => {
    const page = await browser.newPage()
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.waitForLoadState('networkidle')

    // Check that there are KaTeX elements
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)

    // Verify no error elements are present
    const errorElements = await page.locator('.katex-error').count()
    expect(errorElements).toBe(0)

    await page.close()
  })

  afterAll(async () => {
    if (browser) await browser.close()
  })
})
