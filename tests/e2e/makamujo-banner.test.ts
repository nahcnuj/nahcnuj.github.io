/**
 * E2E tests for MakamujoBanner: verify that clicking the banner image-map
 * areas navigates to the correct URLs.
 *
 * The banner has two clickable zones:
 *   - The "ニコニコ生放送で配信中" badge (rect 105,67,306,87) → NicoNico live page
 *   - The rest of the banner (default area) → Makamujo landing page
 */
import { type ChildProcess, spawn } from 'node:child_process'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { chromium, type Browser } from 'playwright'

describe('MakamujoBanner E2E: click navigation', () => {
  let devProcess: ChildProcess
  let baseUrl: string
  let browser: Browser

  beforeAll(async () => {
    baseUrl = await new Promise<string>((resolve, reject) => {
      let resolved = false

      devProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        env: { ...process.env, NO_COLOR: '1' },
      })

      devProcess.stdout?.on('data', (data: Buffer) => {
        const match = data.toString().match(/https?:\/\/localhost:\d+/)
        if (match) {
          resolved = true
          resolve(match[0])
        }
      })

      devProcess.on('error', reject)
      devProcess.on('close', (code) => {
        if (!resolved && code !== 0) {
          reject(new Error(`npm run dev exited with code ${code}`))
        }
      })
    })

    browser = await chromium.launch()
  }, 60_000)

  afterAll(async () => {
    await browser?.close()
    devProcess?.kill()
  })

  /**
   * Opens the home page, intercepts the outgoing navigation triggered by
   * clicking at (x, y) relative to the banner image, and returns the target URL.
   * External resource and navigation requests are blocked to prevent loading
   * third-party sites during tests.
   */
  async function clickBannerAt(x: number, y: number): Promise<string> {
    const context = await browser.newContext()

    const navigationUrlPromise = new Promise<string>((resolve) => {
      context.route('**/*', (route) => {
        const url = route.request().url()
        if (url.startsWith(baseUrl)) {
          route.continue()
          return
        }
        if (route.request().isNavigationRequest()) {
          resolve(url)
        }
        route.abort()
      })
    })

    const page = await context.newPage()
    await page.goto(baseUrl)

    const img = page.locator('img[usemap="#makamujo-banner-map"]')
    const box = await img.boundingBox()
    if (!box) throw new Error('Banner image not found or has no layout bounding box')

    // Click at (x, y) relative to the top-left corner of the banner image
    await page.mouse.click(box.x + x, box.y + y)

    const url = await navigationUrlPromise
    await context.close()
    return url
  }

  it('clicking the NicoNico badge navigates to the program viewing page', async () => {
    // The badge occupies rect (105,67)-(306,87); its center is (205, 77)
    const url = await clickBannerAt(205, 77)
    expect(url).toBe('https://live.nicovideo.jp/watch/user/14171889')
  }, 30_000)

  it('clicking outside the badge navigates to the Makamujo landing page', async () => {
    // (50, 30) is in the top-left area of the banner, clearly outside the badge rect
    const url = await clickBannerAt(50, 30)
    expect(url).toBe('https://www.nahcnuj.work/makamujo/index.html')
  }, 30_000)
})
