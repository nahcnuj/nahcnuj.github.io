/**
 * E2E tests for Markdown download links on app/fixtures/essays/download-link.mdx.
 *
 * Verifies that Markdown links like [ダウンロード](./test.pdf) become popover
 * buttons, start downloading immediately on click, and show an AdSense popup.
 */
import { type ChildProcess, spawn } from 'node:child_process'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { chromium, type Browser, type Page } from 'playwright'
import { expectDownloadAdDialogHtml } from '../../app/lib/downloadAdExpectations'
import { DOWNLOAD_FALLBACK_LINK_TEXT } from '../../app/lib/downloadAd'
import { ADSENSE_CLIENT_ID } from '../../app/lib/site'

const FIXTURE_ROUTE = '/essays/download-link'
const DOWNLOAD_BUTTON_TEXT = 'ダウンロード'
const POPOVER_SELECTOR = '[popover][aria-label="ダウンロード時の広告"]:popover-open'

describe('Download link E2E: popup and download flow', () => {
  let devProcess: ChildProcess
  let baseUrl: string
  let browser: Browser

  beforeAll(async () => {
    baseUrl = await new Promise<string>((resolve, reject) => {
      let resolved = false
      let stderr = ''

      devProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        env: { ...process.env, NO_COLOR: '1' },
        detached: process.platform !== 'win32',
        shell: process.platform === 'win32',
      })

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
    if (!devProcess) return

    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(devProcess.pid), '/T', '/F'], { shell: true })
      return
    }

    await new Promise<void>((resolve) => {
      const pid = devProcess.pid
      const killTimeout = setTimeout(() => {
        try {
          if (pid) process.kill(-pid, 'SIGKILL')
          else devProcess.kill('SIGKILL')
        } catch {
          /* already dead */
        }
        resolve()
      }, 5_000)
      devProcess.on('close', () => {
        clearTimeout(killTimeout)
        resolve()
      })
      try {
        if (pid) process.kill(-pid, 'SIGTERM')
        else devProcess.kill('SIGTERM')
      } catch {
        resolve()
      }
    })
  }, 15_000)

  async function openFixturePage(): Promise<Page> {
    const page = await browser.newPage()
    const res = await page.goto(`${baseUrl}${FIXTURE_ROUTE}`)
    expect(res?.status()).toBe(200)
    return page
  }

  it('includes required AdSense loader and download popup markup in the HTML output', async () => {
    const response = await browser.newContext().then((context) => context.request.get(`${baseUrl}${FIXTURE_ROUTE}`))
    expect(response.status()).toBe(200)

    const html = await response.text()
    expect(html).toMatch(
      new RegExp(`<script[^>]*src="[^"]*adsbygoogle\\.js\\?client=${ADSENSE_CLIENT_ID}"[^>]*>`),
    )
    expectDownloadAdDialogHtml(html)
  }, 30_000)

  it('serves the fixture page with a popover download button', async () => {
    const page = await openFixturePage()
    const button = page.getByRole('button', { name: DOWNLOAD_BUTTON_TEXT })

    expect(await button.getAttribute('data-download-ad')).toBe('')
    expect(await button.getAttribute('data-download-href')).toBe('./test.pdf')
    expect(await button.getAttribute('data-download')).toBe('')
    expect(await button.getAttribute('popovertarget')).toBe('download-ad-popup')
    expect(await button.getAttribute('popovertargetaction')).toBe('show')

    await page.close()
  }, 30_000)

  it('starts downloading and opens a popup when the download link is clicked', async () => {
    const page = await openFixturePage()

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: DOWNLOAD_BUTTON_TEXT }).click(),
    ])

    expect(download.suggestedFilename()).toBe('test.pdf')

    const popover = page.locator(POPOVER_SELECTOR)
    expect(await popover.count()).toBe(1)
    expect(await popover.getByText('ダウンロードを開始しました。').isVisible()).toBe(true)
    expect(await popover.getByRole('link', { name: DOWNLOAD_FALLBACK_LINK_TEXT }).isVisible()).toBe(true)
    expect(await popover.getByRole('button', { name: '閉じる（×）' }).isVisible()).toBe(true)
    expect(await popover.getByRole('button', { name: '閉じる', exact: true }).isVisible()).toBe(true)

    await page.close()
  }, 30_000)

  it('does not open another popup when the fallback link is clicked', async () => {
    const page = await openFixturePage()
    await page.getByRole('button', { name: DOWNLOAD_BUTTON_TEXT }).click()

    const popover = page.locator(POPOVER_SELECTOR)
    const fallbackLink = popover.getByRole('link', { name: DOWNLOAD_FALLBACK_LINK_TEXT })
    expect(await fallbackLink.getAttribute('data-download-ad')).toBeNull()
    expect(await fallbackLink.getAttribute('download')).toBe('')

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      fallbackLink.click(),
    ])

    expect(download.suggestedFilename()).toBe('test.pdf')
    expect(await page.locator(POPOVER_SELECTOR).count()).toBe(1)

    await page.close()
  }, 30_000)

  it('closes the popup when 閉じる is clicked', async () => {
    const page = await openFixturePage()
    await page.getByRole('button', { name: DOWNLOAD_BUTTON_TEXT }).click()

    const popover = page.locator(POPOVER_SELECTOR)
    await popover.getByRole('button', { name: '閉じる', exact: true }).click()
    expect(await popover.count()).toBe(0)

    await page.close()
  }, 30_000)

  it('closes the popup when Escape is pressed', async () => {
    const page = await openFixturePage()
    await page.getByRole('button', { name: DOWNLOAD_BUTTON_TEXT }).click()

    const popover = page.locator(POPOVER_SELECTOR)
    expect(await popover.count()).toBe(1)
    await page.keyboard.press('Escape')
    expect(await popover.count()).toBe(0)

    await page.close()
  }, 30_000)
})