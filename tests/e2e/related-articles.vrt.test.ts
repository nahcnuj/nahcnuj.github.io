import { type Page, expect, test } from '@playwright/test'

/**
 * Works has only two fixture articles, so related list content is deterministic
 * (always the other work + PR). Prefer this over essays, where pickRandomN varies.
 */
const FIXTURE_ROUTE = '/works/fixture-work'

const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '1280', width: 1280, height: 1024 },
  { name: '1440', width: 1440, height: 1024 },
] as const

test.describe.configure({ mode: 'serial' })

async function gotoWithRetry(page: Page, url: string, attempts = 3): Promise<void> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      return
    } catch (error) {
      lastError = error
      await page.waitForTimeout(500 * (i + 1))
    }
  }
  throw lastError
}

async function relatedSectionClip(page: Page): Promise<{ x: number; y: number; width: number; height: number }> {
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
    width: box.width + 16,
    height: box.height + 16,
  }
}

test('related articles with PR ad at 375 / 1280 / 1440', async ({ page }) => {
  await page.route('**/adsbygoogle.js**', (route) => route.abort())

  await gotoWithRetry(page, FIXTURE_ROUTE)
  const heading = page.getByRole('heading', { name: '他の記事', exact: true })
  await expect(heading).toBeVisible()
  await expect(page.getByRole('link', { name: /【PR】/ })).toBeVisible()

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await heading.scrollIntoViewIfNeeded()
    await page.waitForTimeout(100)

    const clip = await relatedSectionClip(page)
    clip.width = Math.min(viewport.width, clip.width)

    await expect(page).toHaveScreenshot(`related-articles-pr-${viewport.name}.png`, { clip })
  }
})
