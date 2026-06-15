import * as fs from 'fs'
import * as path from 'path'
import { chromium } from 'playwright'

const baseDir = 'tests/e2e/math-rendering.vrt.test.ts-snapshots'

// Ensure directory exists
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true })
}

const viewports = [
  { width: 375, height: 667, name: 'mobile-375' },
  { width: 1280, height: 720, name: 'medium-1280' },
  { width: 1440, height: 900, name: 'wide-1440' },
]

const url = 'https://www.nahcnuj.work/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html'

;(async () => {
  const browser = await chromium.launch()
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      })
      const page = await context.newPage()

      console.log(`Navigating to ${url} with ${viewport.width}px viewport...`)
      await page.goto(url, { waitUntil: 'load', timeout: 60000 })

      // Wait for math rendering
      await page.waitForTimeout(2000)

      const filename = `math-page-${viewport.name}-chromium-win32.png`
      const filepath = path.join(baseDir, filename)

      console.log(`Taking screenshot: ${filepath}`)
      await page.screenshot({ path: filepath, fullPage: true })

      await context.close()
    }
    console.log('All screenshots captured successfully!')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
})()
