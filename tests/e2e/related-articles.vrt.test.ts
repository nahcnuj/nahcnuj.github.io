import { type Page, expect, test } from '@playwright/test'

/**
 * Diary fixture pages always have a deterministic related set in dev
 * (the other diary fixtures, sorted by path) plus the mixed-in PR entry.
 */
const FIXTURE_ROUTE = '/diary/2026-02-09'

const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '1280', width: 1280, height: 1024 },
  { name: '1440', width: 1440, height: 1024 },
] as const

// Independent per viewport so one snapshot failure does not skip the rest in CI.
test.describe.configure({ mode: 'parallel' })

test.beforeEach(async ({ page }) => {
  await page.route('**/adsbygoogle.js**', (route) => route.abort())
})

async function openRelatedSection(page: Page, viewport: { width: number; height: number }): Promise<void> {
  await page.setViewportSize(viewport)
  const response = await page.goto(FIXTURE_ROUTE, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  expect(response, `GET ${FIXTURE_ROUTE}`).not.toBeNull()
  expect(response?.ok(), `GET ${FIXTURE_ROUTE} status ${response?.status()}`).toBe(true)

  const heading = page.getByRole('heading', { name: '他の記事', exact: true })
  await expect(heading).toBeVisible({ timeout: 15_000 })
  await heading.scrollIntoViewIfNeeded()
  await expect(page.getByRole('link', { name: /【PR】/ })).toBeVisible()
  // PR row should show the same-style list icon as other related items
  await expect(page.locator('a[href*="adf.shinobi.jp"]').locator('xpath=preceding-sibling::span[1]')).toBeVisible()
  await page.waitForTimeout(150)
}

async function relatedSectionClip(page: Page, viewportWidth: number): Promise<{
  x: number
  y: number
  width: number
  height: number
}> {
  const box = await page.evaluate(() => {
    const h2 = [...document.querySelectorAll('h2')].find((el) => el.textContent === '他の記事')
    const related = h2?.nextElementSibling as HTMLElement | null
    if (!h2 || !related) return null
    const a = h2.getBoundingClientRect()
    const b = related.getBoundingClientRect()
    const x = Math.min(a.x, b.x)
    const y = Math.min(a.y, b.y)
    const right = Math.max(a.right, b.right)
    const bottom = Math.max(a.bottom, b.bottom)
    return { x, y, width: right - x, height: bottom - y }
  })
  if (!box) throw new Error('related articles section not found')
  return {
    x: Math.max(0, box.x - 8),
    y: Math.max(0, box.y - 8),
    width: Math.min(viewportWidth, box.width + 16),
    height: box.height + 16,
  }
}

for (const viewport of VIEWPORTS) {
  test(`related articles with PR ad on ${viewport.name}px`, async ({ page }) => {
    await openRelatedSection(page, viewport)
    const clip = await relatedSectionClip(page, viewport.width)
    await expect(page).toHaveScreenshot(`related-articles-pr-${viewport.name}.png`, {
      clip,
      // Match download-ad-dialog VRT tolerance for font/subpixel drift across runners.
      maxDiffPixelRatio: 0.1,
    })
  })
}
