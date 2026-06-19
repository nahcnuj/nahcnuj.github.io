/**
 * E2E Test: Math rendering functional verification
 *
 * Tests that KaTeX math is rendered with correct DOM structure and CSS classes.
 * Verifies the functional aspects of math rendering (not visual regression).
 *
 * Run with: npm run test:e2e
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const baseDir = join(__dirname, '../../dist')

test.describe('Math Rendering E2E', () => {
  test.setTimeout(30 * 1000) // 30 second timeout per test

  // Verify KaTeX elements are rendered with CSS classes (Computer Modern font)
  test('KaTeX elements are rendered with correct CSS classes', async ({
    page,
  }) => {
    // Block external resources to speed up loading
    await page.route('https://**', (route) => route.abort('blockedbyclient'))

    await page.goto(
      `file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`,
      { waitUntil: 'domcontentloaded' }
    )

    // Verify KaTeX CSS classes are rendered (Computer Modern font)
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)

    // Verify display math has proper styling
    const displayMathElements = await page.locator('.katex-display').count()
    expect(displayMathElements).toBeGreaterThan(0)

    // Verify inline math has proper styling
    const inlineMathElements = await page
      .locator('.katex:not(.katex-display)')
      .count()
    expect(inlineMathElements).toBeGreaterThan(0)
  })

  // Verify split environments rendered (note: some align* may produce warnings)
  test('align* environments render without breaking', async ({ page }) => {
    // Block external resources to speed up loading
    await page.route('https://**', (route) => route.abort('blockedbyclient'))

    await page.goto(
      `file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`,
      { waitUntil: 'domcontentloaded' }
    )

    // At least some KaTeX elements should render successfully
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)

    // Verify SVG paths are rendered (part of KaTeX output)
    const svgElements = await page.locator('svg').count()
    expect(svgElements).toBeGreaterThan(0)
  })

  // Verify math fixture page renders with correct structure
  test('math fixture page renders correctly', async ({ page }) => {
    // Block external resources to speed up loading
    await page.route('https://**', (route) => route.abort('blockedbyclient'))

    await page.goto(
      `file://${baseDir}/essays/math-markdown-syntax-fixture.html`,
      { waitUntil: 'domcontentloaded' }
    )

    // Verify the page loads without errors
    expect(page.url()).toContain('math-markdown-syntax-fixture')

    // Verify KaTeX is loaded
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)

    // Verify math symbols are rendered in HTML structure
    const mathHtmlElements = await page.locator('.katex-html').count()
    expect(mathHtmlElements).toBeGreaterThan(0)
  })
})
