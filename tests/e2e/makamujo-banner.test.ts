/**
 * E2E tests for MakamujoBanner: verify that clicking the banner image-map
 * areas navigates to the correct URLs and fires the correct GA events.
 *
 * The banner has two clickable zones:
 *   - The "ニコニコ生放送で配信中" badge (rect 105,67,306,87) → NicoNico live page
 *   - The rest of the banner (default area) → Makamujo landing page
 */
import { type ChildProcess, spawn } from 'node:child_process'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { chromium, type Browser } from 'playwright'

function spawnNpmRunDev() {
  const npmExecPath = process.env.npm_execpath
  if (npmExecPath) {
    return spawn(process.execPath, [npmExecPath, 'run', 'dev'], {
      stdio: 'pipe',
      env: { ...process.env, NO_COLOR: '1' },
      detached: true,
    })
  }

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  return spawn(npmCommand, ['run', 'dev'], {
    stdio: 'pipe',
    env: { ...process.env, NO_COLOR: '1' },
    detached: true,
  })
}

describe('MakamujoBanner E2E: click navigation', () => {
  let devProcess: ChildProcess
  let baseUrl: string
  let browser: Browser

  beforeAll(async () => {
    baseUrl = await new Promise<string>((resolve, reject) => {
      let resolved = false
      let stderr = ''

      devProcess = spawnNpmRunDev() // new process group so we can kill npm + vite together

      devProcess.stdout?.on('data', (data: Buffer) => {
        const match = data.toString().match(/https?:\/\/localhost:\d+/)
        if (match) {
          resolved = true
          resolve(match[0])
        }
      })

      devProcess.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString()
      })

      devProcess.on('error', reject)
      devProcess.on('close', (code) => {
        if (!resolved) {
          reject(new Error(`npm run dev exited with code ${code} before URL was detected\n${stderr}`))
        }
      })
    })

    browser = await chromium.launch()
  }, 60_000)

  afterAll(async () => {
    await browser?.close()
    if (devProcess) {
      await new Promise<void>((resolve) => {
        const pid = devProcess.pid
        let settled = false
        const finish = () => {
          if (settled) return
          settled = true
          clearTimeout(forceKillTimeout)
          clearTimeout(forceResolveTimeout)
          resolve()
        }

        const forceKillTimeout = setTimeout(() => {
          try {
            if (pid) process.kill(-pid, 'SIGKILL')
            else devProcess.kill('SIGKILL')
          } catch { /* already dead */ }
        }, 5_000)

        // Avoid hanging forever when child-process close events are not emitted.
        const forceResolveTimeout = setTimeout(() => {
          finish()
        }, 8_000)

        devProcess.once('close', () => {
          finish()
        })

        try {
          if (pid) process.kill(-pid, 'SIGTERM')
          else devProcess.kill('SIGTERM')
        } catch { /* already dead */ }
      })
    }
  }, 30_000)

  /**
   * Opens the home page, clicks at (x, y) relative to the banner image, and
   * returns both the intercepted outgoing navigation URL and the GA event name
   * that was fired (captured from the dev-mode `console.log('[gtag]', ...)` call).
   */
  async function clickBannerAt(x: number, y: number): Promise<{ url: string; gtagEventName: string }> {
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

    // In dev mode, setupMakamujoBannerTracking calls
    //   console.log('[gtag]', 'event', eventName, { event_callback, event_timeout })
    // Capture it by inspecting the console message arguments.
    const gtagEventNamePromise = new Promise<string>((resolve) => {
      page.on('console', (msg) => {
        if (msg.type() !== 'log') return
        const args = msg.args()
        if (args.length < 3) return
        void (async () => {
          try {
            const [prefix, command, eventName] = await Promise.all([
              args[0].jsonValue(),
              args[1].jsonValue(),
              args[2].jsonValue(),
            ])
            if (prefix === '[gtag]' && command === 'event' && typeof eventName === 'string') {
              resolve(eventName)
            }
          } catch { /* ignore serialization errors */ }
        })()
      })
    })

    await page.goto(baseUrl)

    const img = page.locator('img[usemap="#makamujo-banner-map"]')
    const box = await img.boundingBox()
    if (!box) throw new Error('Banner image not found or has no layout bounding box')

    // Click at (x, y) relative to the top-left corner of the banner image
    await page.mouse.click(box.x + x, box.y + y)

    // The gtag console.log fires synchronously on click; navigation fires 500 ms
    // later (fallback timeout). Both promises should resolve before the test timeout.
    const [url, gtagEventName] = await Promise.all([navigationUrlPromise, gtagEventNamePromise])
    await context.close()
    return { url, gtagEventName }
  }

  it('clicking the NicoNico badge navigates to the program viewing page and fires click_makamujo_nicovideo GA event', async () => {
    // The badge occupies rect (105,67)-(306,87); its center is (205, 77)
    const { url, gtagEventName } = await clickBannerAt(205, 77)
    expect(url).toBe('https://live.nicovideo.jp/watch/user/14171889')
    expect(gtagEventName).toBe('click_makamujo_nicovideo')
  }, 30_000)

  it('clicking outside the badge navigates to the Makamujo landing page and fires click_makamujo_landing GA event', async () => {
    // (50, 30) is in the top-left area of the banner, clearly outside the badge rect
    const { url, gtagEventName } = await clickBannerAt(50, 30)
    expect(url).toBe('https://www.nahcnuj.work/makamujo/index.html')
    expect(gtagEventName).toBe('click_makamujo_landing')
  }, 30_000)
})
