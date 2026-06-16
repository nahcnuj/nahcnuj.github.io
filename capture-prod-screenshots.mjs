import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const viewports = [
  { name: 'mobile-375px', width: 375, height: 667 },
  { name: 'medium-1280px', width: 1280, height: 800 },
  { name: 'wide-1440px', width: 1440, height: 900 },
]

const snapshotDir = path.join(__dirname, 'tests', 'e2e', '__snapshots__')
const prodUrl = 'https://www.nahcnuj.work/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html'

async function captureProductionScreenshots() {
  const browser = await chromium.launch()

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      })

      const page = await context.newPage()
      console.log(`Navigating to: ${prodUrl}`)
      await page.goto(prodUrl, { waitUntil: 'load', timeout: 60000 })

      // Wait for math rendering
      await page.waitForTimeout(2000)

      const snapshotName = `math-rendering.vrt.test.ts-Math-Rendering-VRT-math-page-renders-correctly-on-${viewport.name}-win32.png`
      const snapshotPath = path.join(snapshotDir, snapshotName)

      console.log(`Capturing ${viewport.name} (${viewport.width}x${viewport.height})...`)
      await page.screenshot({
        path: snapshotPath,
        fullPage: true,
      })
      console.log(`✓ Saved: ${snapshotPath}`)

      await context.close()
    }

    console.log('\n✓ All production screenshots captured successfully')
  } finally {
    await browser.close()
  }
}

captureProductionScreenshots().catch((err) => {
  console.error('Error capturing screenshots:', err)
  process.exit(1)
})
