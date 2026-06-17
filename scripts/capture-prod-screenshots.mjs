import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { chromium } from 'playwright'

const testUrl = 'https://www.nahcnuj.work/essays/math/electronics/derive-fourier-transform-of-gaussian-filter.html'
const snapshotDir = 'tests/e2e/math-rendering.vrt.test.ts-snapshots'

const sizes = [
  { width: 375, height: 812, label: 'mobile-375px' },
  { width: 1280, height: 1024, label: 'medium-PC-1280px' },
  { width: 1440, height: 900, label: 'wide-PC-1440px' },
]

;(async () => {
  mkdirSync(snapshotDir, { recursive: true })

  const browser = await chromium.launch()
  console.log('ブラウザを起動しました')

  for (const size of sizes) {
    try {
      const context = await browser.newContext()
      const page = await context.newPage()

      console.log(`\n📸 ${size.label} でスクリーンショット取得中...`)
      await page.goto(testUrl, { waitUntil: 'networkidle' })
      await page.setViewportSize({ width: size.width, height: size.height })
      await page.waitForLoadState('networkidle')

      const filename = `Math-Rendering-VRT-math-page-renders-correctly-on-${size.label}-1-chromium-win32.png`
      const filepath = join(snapshotDir, filename)

      await page.screenshot({ path: filepath, fullPage: true })
      console.log(`✅ ${filename} を保存しました`)

      await context.close()
    } catch (error) {
      console.error(`❌ ${size.label} でエラー: ${error.message}`)
    }
  }

  await browser.close()
  console.log('\n✨ すべてのスクリーンショットが完了しました')
})()
