/**
 * Windows-only regression test: Math rendering in essay pages
 *
 * Verifies that KaTeX-rendered math displays correctly and pages load
 * successfully at various screen sizes without rendering errors.
 *
 * Run with: npm run test:vrt
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const baseDir = join(__dirname, '../../dist')

test.describe('Math Rendering VRT (Windows)', () => {
  // Test at mobile size (375px - per AGENTS.md)
  test('math page loads without errors on mobile (375px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`, {
      waitUntil: 'domcontentloaded',
    })
    await page.setViewportSize({ width: 375, height: 812 })

    // Verify no KaTeX errors are rendered
    const errorElements = await page.locator('.katex-error').count()
    expect(errorElements).toBe(0)

    // Verify at least some math content is rendered
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)
  })

  // Test at medium PC size (1280px - per AGENTS.md)
  test('math page loads without errors on medium PC (1280px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`, {
      waitUntil: 'domcontentloaded',
    })
    await page.setViewportSize({ width: 1280, height: 1024 })

    // Verify no KaTeX errors are rendered
    const errorElements = await page.locator('.katex-error').count()
    expect(errorElements).toBe(0)

    // Verify at least some math content is rendered
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)
  })

  // Test at wide PC size (1440px - per AGENTS.md)
  test('math page loads without errors on wide PC (1440px)', async ({ page }) => {
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`, {
      waitUntil: 'domcontentloaded',
    })
    await page.setViewportSize({ width: 1440, height: 900 })

    // Verify no KaTeX errors are rendered
    const errorElements = await page.locator('.katex-error').count()
    expect(errorElements).toBe(0)

    // Verify at least some math content is rendered
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)
  })
})
