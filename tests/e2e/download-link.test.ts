/**
 * E2E tests for Markdown download links.
 *
 * Verifies that Markdown links like [ダウンロード](./test.pdf) become popover
 * buttons and that clicking the button starts a download (or opens a new tab
 * for cross-origin links) via a transient anchor in client script. The fallback
 * link inside the ad dialog is a normal anchor for manual retry; its click
 * behavior is the browser's responsibility and is not tested here.
 */
import { type ChildProcess, spawn } from 'node:child_process'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { chromium, type Browser, type Page } from 'playwright'
import {
  DOWNLOAD_AD_FALLBACK_ID,
  DOWNLOAD_DIALOG_CLASS,
  DOWNLOAD_DIALOG_LABEL,
  DOWNLOAD_FALLBACK_LINK_TEXT,
} from '../../app/components/DownloadAdDialog'
import { DOWNLOAD_AD_POPUP_ID } from '../../app/lib/downloadLinkPlugin'
import { ADSENSE_CLIENT_ID, DOWNLOAD_AD_SLOT } from '../../app/lib/site'

function assertDefined<T>(value: T | undefined, message: string): asserts value is T {
  expect(value, message).toBeDefined()
  if (value === undefined) {
    throw new Error(message)
  }
}

function htmlAttr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`))
  return match?.[1]
}

function firstHtmlTag(html: string, selector: string): string | undefined {
  if (selector.startsWith('#')) {
    const id = selector.slice(1)
    const match = html.match(new RegExp(`<[^>]+id="${id}"[^>]*>`, 'i'))
    return match?.[0]
  }
  if (selector.startsWith('.')) {
    const className = selector.slice(1)
    const match = html.match(new RegExp(`<[^>]+class="${className}"[^>]*>`, 'i'))
    return match?.[0]
  }
  const match = html.match(new RegExp(`<${selector}[^>]*>`, 'i'))
  return match?.[0]
}

const FIXTURE_ROUTE = '/essays/download-link'
const MULTI_FIXTURE_ROUTE = '/essays/download-links'
const CROSS_ORIGIN_FIXTURE_ROUTE = '/works/download-link-test'
const DOWNLOAD_BUTTON_TEXT = 'ダウンロード'
const FIRST_MULTI_DOWNLOAD_BUTTON_TEXT = 'PDFをダウンロード'
const SECOND_MULTI_DOWNLOAD_BUTTON_TEXT = '同じPDFをダウンロード'
const CROSS_ORIGIN_DOWNLOAD_BUTTON_TEXT = 'サンプルファイルをダウンロード'
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

    const popover = firstHtmlTag(html, `#${DOWNLOAD_AD_POPUP_ID}`)
    assertDefined(popover, 'download popover element')
    expect(htmlAttr(popover, 'popover')).toBe('auto')
    expect(htmlAttr(popover, 'class')).toBe(DOWNLOAD_DIALOG_CLASS)
    expect(htmlAttr(popover, 'aria-label')).toBe(DOWNLOAD_DIALOG_LABEL)

    const closeIcon = html.match(/<button[^>]*class="download-ad-close-icon"[^>]*>/i)?.[0]
    assertDefined(closeIcon, 'close icon button')
    expect(htmlAttr(closeIcon, 'type')).toBe('button')
    expect(htmlAttr(closeIcon, 'popovertarget')).toBe(DOWNLOAD_AD_POPUP_ID)
    expect(htmlAttr(closeIcon, 'popovertargetaction')).toBe('hide')
    expect(htmlAttr(closeIcon, 'aria-label')).toBe('閉じる（×）')

    const fallback = firstHtmlTag(html, `#${DOWNLOAD_AD_FALLBACK_ID}`)
    assertDefined(fallback, 'fallback download link')
    expect(htmlAttr(fallback, 'href')).toBe('#')
    expect(html).toContain(DOWNLOAD_FALLBACK_LINK_TEXT)
    expect(html).toContain('ダウンロードを開始しました。')

    const ins = firstHtmlTag(html, 'ins')
    assertDefined(ins, 'AdSense ins element')
    expect(htmlAttr(ins, 'class')).toBe('adsbygoogle')
    expect(htmlAttr(ins, 'style')).toBe('display:block')
    expect(htmlAttr(ins, 'data-ad-client')).toBe(ADSENSE_CLIENT_ID)
    expect(htmlAttr(ins, 'data-ad-slot')).toBe(DOWNLOAD_AD_SLOT)
    expect(htmlAttr(ins, 'data-ad-format')).toBe('auto')
    expect(htmlAttr(ins, 'data-full-width-responsive')).toBe('true')
    expect(html).toContain('(adsbygoogle = window.adsbygoogle || []).push({})')

    const closeButton = html.match(/<button[^>]*class="download-ad-close"[^>]*>/i)?.[0]
    assertDefined(closeButton, 'close button')
    expect(htmlAttr(closeButton, 'type')).toBe('button')
    expect(htmlAttr(closeButton, 'popovertarget')).toBe(DOWNLOAD_AD_POPUP_ID)
    expect(htmlAttr(closeButton, 'popovertargetaction')).toBe('hide')
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

  it('fires a file_download GA event when the download button is clicked', async () => {
    const page = await openFixturePage()

    const gtagEventPromise = new Promise<{ eventName: string; params: Record<string, unknown> }>((resolve) => {
      page.on('console', (msg) => {
        if (msg.type() !== 'log') return
        const args = msg.args()
        if (args.length < 4) return
        void (async () => {
          try {
            const [prefix, command, eventName, params] = await Promise.all([
              args[0].jsonValue(),
              args[1].jsonValue(),
              args[2].jsonValue(),
              args[3].jsonValue(),
            ])
            if (prefix === '[gtag]' && command === 'event' && eventName === 'file_download') {
              resolve({ eventName, params: params as Record<string, unknown> })
            }
          } catch {
            /* ignore serialization errors */
          }
        })()
      })
    })

    await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: DOWNLOAD_BUTTON_TEXT }).click(),
    ])

    const { eventName, params } = await gtagEventPromise
    expect(eventName).toBe('file_download')
    expect(params).toMatchObject({
      file_name: 'test.pdf',
      file_extension: 'pdf',
      link_text: DOWNLOAD_BUTTON_TEXT,
      link_id: FIXTURE_ROUTE,
    })
    expect(params.link_url).toMatch(/\/essays\/test\.pdf$/)

    await page.close()
  }, 30_000)

  it('starts a real download from the button click (transient anchor, no DOM attachment)', async () => {
    const page = await openFixturePage()

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: DOWNLOAD_BUTTON_TEXT }).click(),
    ])

    expect(download.suggestedFilename()).toBe('test.pdf')

    const popover = page.locator(POPOVER_SELECTOR)
    expect(await popover.count()).toBe(1)
    expect(await popover.getByText('ダウンロードを開始しました。').isVisible()).toBe(true)
    expect(await popover.getByRole('button', { name: '閉じる（×）' }).isVisible()).toBe(true)
    expect(await popover.getByRole('button', { name: '閉じる', exact: true }).isVisible()).toBe(true)

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

  it('serves a fixture with multiple popover download buttons sharing one popup', async () => {
    const page = await browser.newPage()
    const res = await page.goto(`${baseUrl}${MULTI_FIXTURE_ROUTE}`)
    expect(res?.status()).toBe(200)

    const buttons = page.getByRole('button', { name: /ダウンロード/ })
    expect(await buttons.count()).toBe(2)

    const first = page.getByRole('button', { name: FIRST_MULTI_DOWNLOAD_BUTTON_TEXT, exact: true })
    const second = page.getByRole('button', { name: SECOND_MULTI_DOWNLOAD_BUTTON_TEXT, exact: true })
    for (const button of [first, second]) {
      expect(await button.getAttribute('data-download-ad')).toBe('')
      expect(await button.getAttribute('data-download-href')).toBe('./test.pdf')
      expect(await button.getAttribute('data-download')).toBe('')
      expect(await button.getAttribute('popovertarget')).toBe('download-ad-popup')
      expect(await button.getAttribute('popovertargetaction')).toBe('show')
    }

    expect(await page.locator('[popover]#download-ad-popup').count()).toBe(1)

    await page.close()
  }, 30_000)

  it('starts a download from each button when multiple links point at the same file', async () => {
    const page = await browser.newPage()
    await page.goto(`${baseUrl}${MULTI_FIXTURE_ROUTE}`)

    const first = page.getByRole('button', { name: FIRST_MULTI_DOWNLOAD_BUTTON_TEXT, exact: true })
    const second = page.getByRole('button', { name: SECOND_MULTI_DOWNLOAD_BUTTON_TEXT, exact: true })

    const [firstDownload] = await Promise.all([page.waitForEvent('download'), first.click()])
    expect(firstDownload.suggestedFilename()).toBe('test.pdf')
    expect(await page.locator(POPOVER_SELECTOR).count()).toBe(1)

    await page.keyboard.press('Escape')
    expect(await page.locator(POPOVER_SELECTOR).count()).toBe(0)

    const [secondDownload] = await Promise.all([page.waitForEvent('download'), second.click()])
    expect(secondDownload.suggestedFilename()).toBe('test.pdf')
    expect(await page.locator(POPOVER_SELECTOR).count()).toBe(1)

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

  it('serves the cross-origin fixture with a stripped download button', async () => {
    const page = await browser.newPage()
    const res = await page.goto(`${baseUrl}${CROSS_ORIGIN_FIXTURE_ROUTE}`)
    expect(res?.status()).toBe(200)

    const button = page.getByRole('button', { name: CROSS_ORIGIN_DOWNLOAD_BUTTON_TEXT })
    expect(await button.getAttribute('data-download-ad')).toBe('')
    expect(await button.getAttribute('data-download-href')).toBe('https://example.com/sample.pdf')
    expect(await button.getAttribute('data-download-new-tab')).toBe('')
    expect(await button.getAttribute('data-download')).toBeNull()
    expect(await button.textContent()).toBe(CROSS_ORIGIN_DOWNLOAD_BUTTON_TEXT)

    await page.close()
  }, 30_000)

  it('opens a popup for cross-origin download buttons without starting a same-origin download', async () => {
    const page = await browser.newPage()
    await page.goto(`${baseUrl}${CROSS_ORIGIN_FIXTURE_ROUTE}`)

    const popupPromise = page.waitForEvent('popup')
    await page.getByRole('button', { name: CROSS_ORIGIN_DOWNLOAD_BUTTON_TEXT }).click()

    const popup = await popupPromise
    expect(popup.url()).toBe('https://example.com/sample.pdf')
    expect(await page.locator(POPOVER_SELECTOR).count()).toBe(1)

    await popup.close()
    await page.close()
  }, 30_000)
})