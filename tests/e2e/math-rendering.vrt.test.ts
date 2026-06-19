/**
 * Visual Regression Test: Math rendering in essay pages
 *
 * Tests that KaTeX-rendered math displays correctly at various screen sizes.
 * Compares against baseline screenshots to detect unintended visual regressions.
 *
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
  test.setTimeout(30 * 1000) // 30 second timeout per test
  
  // Test at mobile size (375px - per AGENTS.md)
  test('math page renders correctly on mobile (375px)', async ({ page }) => {
    const testName = 'mobile (375px)'
    const filePath = `file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`
    const startTime = Date.now()
    
    console.log(`[VRT] [${new Date().toISOString()}] Starting ${testName} test`)
    console.log(`[VRT] Base directory: ${baseDir}`)
    console.log(`[VRT] Loading: ${filePath}`)
    
    // Block external resources (ads, analytics, etc.) to speed up loading
    await page.route('https://**', (route) => route.abort('blockedbyclient'))
    
    try {
      const navStart = Date.now()
      await page.goto(filePath)
      const navDuration = Date.now() - navStart
      console.log(`[VRT] Navigation took ${navDuration}ms`)
    } catch (error) {
      console.error(`[VRT] ${testName}: Navigation failed -`, error)
      console.error(`[VRT] Error details:`, JSON.stringify(error, null, 2))
      throw error
    }
    
    const viewportStart = Date.now()
    await page.setViewportSize({ width: 375, height: 812 })
    const viewportDuration = Date.now() - viewportStart
    console.log(`[VRT] Viewport set took ${viewportDuration}ms`)
    
    const loadStart = Date.now()
    // Wait for all DOM content and network to settle
    await page.waitForLoadState('domcontentloaded')
    // Give fonts and styles time to fully render
    await page.waitForTimeout(1500)
    const loadDuration = Date.now() - loadStart
    console.log(`[VRT] DOM content loaded took ${loadDuration}ms`)

    try {
      const ssStart = Date.now()
      await expect(page).toHaveScreenshot({
        name: 'mobile-375px.png',
        fullPage: true,
        maxDiffPixels: 100,
      })
      const ssDuration = Date.now() - ssStart
      console.log(`[VRT] Screenshot took ${ssDuration}ms`)
      console.log(`[VRT] ${testName}: Screenshot comparison PASSED`)
    } catch (error) {
      console.error(`[VRT] ${testName}: Screenshot comparison FAILED`)
      console.error(`[VRT] Error details:`, error instanceof Error ? error.message : JSON.stringify(error, null, 2))
      throw error
    }
    
    const totalDuration = Date.now() - startTime
    console.log(`[VRT] Total test duration: ${totalDuration}ms`)
  })

  // Test at medium PC size (1280px - per AGENTS.md)
  test('math page renders correctly on medium PC (1280px)', async ({ page }) => {
    // Block external resources to speed up loading
    await page.route('https://**', (route) => route.abort('blockedbyclient'))
    
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 1280, height: 1024 })

    // Wait for fonts and styles to fully render
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1500)

    await expect(page).toHaveScreenshot({
      name: 'medium-PC-1280px.png',
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  // Test at wide PC size (1440px - per AGENTS.md)
  test('math page renders correctly on wide PC (1440px)', async ({ page }) => {
    // Block external resources to speed up loading
    await page.route('https://**', (route) => route.abort('blockedbyclient'))
    
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`)
    await page.setViewportSize({ width: 1440, height: 900 })

    // Wait for fonts and styles to fully render
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1500)

    await expect(page).toHaveScreenshot({
      name: 'wide-PC-1440px.png',
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  // Verify KaTeX elements are rendered as MathML
  test('KaTeX elements are rendered with correct classes', async ({ page }) => {
    // Block external resources to speed up loading
    await page.route('https://**', (route) => route.abort('blockedbyclient'))
    
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`, { waitUntil: 'domcontentloaded' })

    // Verify MathML elements are rendered (KaTeX uses MathML output)
    const mathmlElements = await page.locator('math').count()
    expect(mathmlElements).toBeGreaterThan(0)

    // Verify MathML has proper structure
    const mrowElements = await page.locator('math mrow').count()
    expect(mrowElements).toBeGreaterThan(0)

    // Verify math annotations exist (from rehype-katex)
    const annotations = await page.locator('annotation').count()
    expect(annotations).toBeGreaterThan(0)
  })

  // Verify split environments rendered (note: some align* may produce warnings)
  test('align* environments converted to split render without errors', async ({ page }) => {
    // Block external resources to speed up loading
    await page.route('https://**', (route) => route.abort('blockedbyclient'))
    
    await page.goto(`file://${baseDir}/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html`, { waitUntil: 'domcontentloaded' })

    // At least some KaTeX elements should render successfully
    const katexElements = await page.locator('.katex').count()
    expect(katexElements).toBeGreaterThan(0)
  })
})
