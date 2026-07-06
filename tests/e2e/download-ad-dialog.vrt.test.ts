import { type Page, expect, test } from '@playwright/test'

const FIXTURE_ROUTE = '/essays/download-link'
const DOWNLOAD_BUTTON_TEXT = 'ダウンロード'
const POPOVER_SELECTOR = '#download-ad-popup'

const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '1280', width: 1280, height: 1024 },
  { name: '1440', width: 1440, height: 1024 },
] as const

test.describe.configure({ mode: 'serial' })

test.beforeEach(async ({ page }) => {
  await page.route('**/adsbygoogle.js**', (route) => route.abort())
  page.on('download', (download) => {
    void download.cancel()
  })
})

async function openDownloadPopover(page: Page, viewport: { width: number; height: number }): Promise<void> {
  await page.setViewportSize(viewport)
  await page.goto(FIXTURE_ROUTE, { waitUntil: 'domcontentloaded' })
  const downloadButton = page.getByRole('button', { name: DOWNLOAD_BUTTON_TEXT })
  await expect(downloadButton).toBeVisible()
  await downloadButton.click()
  await expect(page.locator(`${POPOVER_SELECTOR}:popover-open`)).toBeVisible()
  // Wait for Makamujo banner (scoped to popover, since main article banner also present on page) to be visible and fully loaded
  const banner = page.locator(`${POPOVER_SELECTOR} img[src*="makamujo"]`)
  await expect(banner).toBeVisible()
  await banner.evaluate((img: HTMLImageElement) => img.complete || new Promise(r => img.onload = r))
  // Ensure actions are visible so full height including banner is stable for screenshot
  await expect(page.locator(`${POPOVER_SELECTOR} .download-ad-actions`)).toBeVisible()
  await page.waitForTimeout(200) // allow final layout after banner load for consistent height across runs
}

for (const viewport of VIEWPORTS) {
  test(`download popover renders correctly on ${viewport.name}px`, async ({ page }) => {
    await openDownloadPopover(page, viewport)

    await expect(page.locator(POPOVER_SELECTOR)).toHaveScreenshot(`download-popover-${viewport.name}.png`, {
      mask: [
        page.locator('.download-ad-container'),
        page.locator('img[src*="makamujo"]'),
        page.locator('.download-ad-actions'),
      ],
      maxDiffPixelRatio: 0.1,
    })
  })
}