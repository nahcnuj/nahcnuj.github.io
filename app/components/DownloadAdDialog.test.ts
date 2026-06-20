import { renderToReadableStream } from 'hono/jsx/dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ADSENSE_CLIENT_ID, DOWNLOAD_AD_SLOT } from '../lib/site'
import {
  DOWNLOAD_AD_POPUP_ID,
  DOWNLOAD_ATTR_DATA_ATTR,
  DOWNLOAD_HREF_DATA_ATTR,
  DOWNLOAD_NEW_TAB_DATA_ATTR,
} from '../lib/downloadLinkPlugin'
import DownloadAdDialog, {
  DOWNLOAD_AD_FALLBACK_ID,
  DOWNLOAD_DIALOG_CLASS,
  DOWNLOAD_DIALOG_LABEL,
  DOWNLOAD_FALLBACK_LINK_TEXT,
  prepareDownloadAdPopup,
  resolveDownloadHref,
  setupDownloadAdPopup,
} from './DownloadAdDialog'

function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`))
  return match?.[1]
}

function assertDefined<T>(value: T | undefined, message: string): asserts value is T {
  expect(value, message).toBeDefined()
  if (value === undefined) {
    throw new Error(message)
  }
}

function firstTag(html: string, selector: string): string | undefined {
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
  const tagName = selector
  const match = html.match(new RegExp(`<${tagName}[^>]*>`, 'i'))
  return match?.[0]
}

/** Asserts that rendered HTML includes required download-popup elements and attributes. */
export function expectDownloadAdDialogHtml(html: string): void {
  const popover = firstTag(html, `#${DOWNLOAD_AD_POPUP_ID}`)
  assertDefined(popover, 'download popover element')
  expect(attr(popover, 'popover')).toBe('auto')
  expect(attr(popover, 'class')).toBe(DOWNLOAD_DIALOG_CLASS)
  expect(attr(popover, 'aria-label')).toBe(DOWNLOAD_DIALOG_LABEL)

  const closeIcon = html.match(/<button[^>]*class="download-ad-close-icon"[^>]*>/i)?.[0]
  assertDefined(closeIcon, 'close icon button')
  expect(attr(closeIcon, 'type')).toBe('button')
  expect(attr(closeIcon, 'popovertarget')).toBe(DOWNLOAD_AD_POPUP_ID)
  expect(attr(closeIcon, 'popovertargetaction')).toBe('hide')
  expect(attr(closeIcon, 'aria-label')).toBe('閉じる（×）')

  const fallback = firstTag(html, `#${DOWNLOAD_AD_FALLBACK_ID}`)
  assertDefined(fallback, 'fallback download link')
  expect(attr(fallback, 'href')).toBe('#')
  expect(html).toContain(DOWNLOAD_FALLBACK_LINK_TEXT)
  expect(html).toContain('ダウンロードを開始しました。')

  const ins = firstTag(html, 'ins')
  assertDefined(ins, 'AdSense ins element')
  expect(attr(ins, 'class')).toBe('adsbygoogle')
  expect(attr(ins, 'style')).toBe('display:block')
  expect(attr(ins, 'data-ad-client')).toBe(ADSENSE_CLIENT_ID)
  expect(attr(ins, 'data-ad-slot')).toBe(DOWNLOAD_AD_SLOT)
  expect(attr(ins, 'data-ad-format')).toBe('auto')
  expect(attr(ins, 'data-full-width-responsive')).toBe('true')

  expect(html).toContain('(adsbygoogle = window.adsbygoogle || []).push({})')

  const closeButton = html.match(/<button[^>]*class="download-ad-close"[^>]*>/i)?.[0]
  assertDefined(closeButton, 'close button')
  expect(attr(closeButton, 'type')).toBe('button')
  expect(attr(closeButton, 'popovertarget')).toBe(DOWNLOAD_AD_POPUP_ID)
  expect(attr(closeButton, 'popovertargetaction')).toBe('hide')
}

async function renderDownloadAdDialog(): Promise<string> {
  const stream = await renderToReadableStream(DownloadAdDialog())
  return new Response(stream).text()
}

type FakeButton = {
  getAttribute: (name: string) => string | null
  hasAttribute: (name: string) => boolean
}

function makeFakeButton(
  href = 'https://example.com/file.zip',
  opts: { sameOrigin?: boolean; newTab?: boolean } = {},
): FakeButton {
  const { sameOrigin = true, newTab = false } = opts
  return {
    getAttribute: (name) => {
      if (name === DOWNLOAD_HREF_DATA_ATTR) return href
      return null
    },
    hasAttribute: (name) => {
      if (name === DOWNLOAD_ATTR_DATA_ATTR) return sameOrigin
      if (name === DOWNLOAD_NEW_TAB_DATA_ATTR) return newTab
      return false
    },
  }
}

function makeFakePopover() {
  const fallback = {
    download: '',
    removeAttribute: vi.fn(),
    set href(value: string) {
      this._href = value
    },
    get href() {
      return this._href
    },
    _href: '#',
  }

  return {
    querySelector: (selector: string) => (selector === `#${DOWNLOAD_AD_FALLBACK_ID}` ? fallback : null),
    fallback,
  }
}

function makeSetup(
  button: FakeButton | null,
  opts: {
    whenReady?: (fn: () => void) => void
    popover?: ReturnType<typeof makeFakePopover> | null
    startDownload?: ReturnType<typeof vi.fn>
  } = {},
) {
  const whenReady = opts.whenReady ?? ((fn) => fn())
  const popover = opts.popover === undefined ? makeFakePopover() : opts.popover
  const startDownloadFn = opts.startDownload ?? vi.fn()
  let clickHandler: ((event: Event) => void) | undefined

  setupDownloadAdPopup({
    whenReady,
    getPopupElement: () => popover as unknown as HTMLElement | null,
    findDownloadButton: () => (button ? (button as unknown as HTMLButtonElement) : null),
    addClickListener: (handler) => {
      clickHandler = handler
    },
    startDownload: startDownloadFn,
  })

  return { popover, startDownloadFn, triggerClick: () => clickHandler?.({ target: button } as Event) }
}

describe('DownloadAdDialog', () => {
  it('renders required popover, fallback link, and AdSense elements with expected attributes', async () => {
    const html = await renderDownloadAdDialog()
    expectDownloadAdDialogHtml(html)
  })
})

describe('resolveDownloadHref', () => {
  it('resolves relative paths against the document base URL', () => {
    const button = {
      getAttribute: (name: string) => (name === DOWNLOAD_HREF_DATA_ATTR ? './test.pdf' : null),
    } as HTMLButtonElement
    expect(resolveDownloadHref(button, 'http://localhost:5173/essays/download-link')).toBe(
      'http://localhost:5173/essays/test.pdf',
    )
  })
})

describe('prepareDownloadAdPopup', () => {
  it('updates the fallback link href and download attribute', () => {
    const popover = makeFakePopover()
    prepareDownloadAdPopup(popover as unknown as HTMLElement, 'https://example.com/test.pdf', '')
    expect(popover.fallback.href).toBe('https://example.com/test.pdf')
    expect(popover.fallback.download).toBe('')
  })
})

describe('setupDownloadAdPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates the fallback link and starts the download without opening the popover in script', () => {
    const button = makeFakeButton('https://example.com/file.zip')
    const { popover, startDownloadFn, triggerClick } = makeSetup(button)

    triggerClick()
    expect(popover?.fallback.href).toBe('https://example.com/file.zip')
    expect(startDownloadFn).toHaveBeenCalledWith('https://example.com/file.zip', '', false)
  })

  it('opens cross-origin downloads in a new tab', () => {
    const button = makeFakeButton('https://example.com/file.zip', { sameOrigin: false, newTab: true })
    const { startDownloadFn, triggerClick } = makeSetup(button)

    triggerClick()
    expect(startDownloadFn).toHaveBeenCalledWith('https://example.com/file.zip', undefined, true)
  })

  it('still starts the download when the pre-rendered popover is missing', () => {
    const button = makeFakeButton()
    const { startDownloadFn, triggerClick } = makeSetup(button, { popover: null })

    triggerClick()
    expect(startDownloadFn).toHaveBeenCalledWith('https://example.com/file.zip', '', false)
  })

  it('does not attach listeners before whenReady fires', () => {
    let readyFn: (() => void) | undefined
    const button = makeFakeButton()
    const { startDownloadFn, triggerClick } = makeSetup(button, {
      whenReady: (fn) => {
        readyFn = fn
      },
    })

    triggerClick()
    expect(startDownloadFn).not.toHaveBeenCalled()
    readyFn?.()
    triggerClick()
    expect(startDownloadFn).toHaveBeenCalledOnce()
  })
})