import { expect, test } from '@playwright/test'

const FIXTURE_ROUTES = [
  '/essays/is-sqrt-of-squared-x-pm-x',
  '/essays/scroll-depth-test',
] as const

test.describe('Readability compatibility tests', () => {
  for (const route of FIXTURE_ROUTES) {
    test(`should be readerable for ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' })

      // Evaluate readability check within the browser context using CDN module import.
      const isReadable = await page.evaluate(async () => {
        const { isProbablyReaderable } = await import('https://cdn.jsdelivr.net/npm/@mozilla/readability@0.5.0/+esm')
        return isProbablyReaderable(document)
      })

      expect(isReadable).toBe(true)
    })
  }
})
