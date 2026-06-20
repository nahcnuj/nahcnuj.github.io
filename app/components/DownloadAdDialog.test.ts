import { renderToReadableStream } from 'hono/jsx/dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DOWNLOAD_AD_DATA_ATTR,
  DOWNLOAD_AD_POPUP_ID,
  DOWNLOAD_ATTR_DATA_ATTR,
  DOWNLOAD_HREF_DATA_ATTR,
  DOWNLOAD_NEW_TAB_DATA_ATTR,
} from '../lib/downloadLinkPlugin'
import { FILE_DOWNLOAD_EVENT } from '../lib/downloadTracker'
import { ADSENSE_CLIENT_ID, DOWNLOAD_AD_SLOT } from '../lib/site'
import DownloadAdDialog, {
  DOWNLOAD_AD_FALLBACK_ID,
  DOWNLOAD_DIALOG_CLASS,
  DOWNLOAD_DIALOG_LABEL,
  DOWNLOAD_FALLBACK_LINK_TEXT,
  resolveDownloadHref,
  setupDownloadAdPopup,
} from './DownloadAdDialog'

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

async function renderDownloadAdDialog(): Promise<string> {
  const stream = await renderToReadableStream(DownloadAdDialog())
  return new Response(stream).text()
}

type FakeButton = {
  getAttribute: (name: string) => string | null
  hasAttribute: (name: string) => boolean
  textContent?: string
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

const DOWNLOAD_BUTTON_SELECTOR = `button[${DOWNLOAD_AD_DATA_ATTR}]`
const MULTI_LINK_BASE_URL = 'http://localhost:5173/essays/download-links'

function makeClickableButton(
  href: string,
  opts: { sameOrigin?: boolean; newTab?: boolean } = {},
): FakeButton & { closest: (selector: string) => FakeButton | null } {
  const button = makeFakeButton(href, opts)
  return {
    ...button,
    closest: (selector) => (selector === DOWNLOAD_BUTTON_SELECTOR ? button : null),
  }
}

function makeSetup(
  button: FakeButton | null,
  opts: {
    whenReady?: (fn: () => void) => void
    popover?: HTMLElement | null
    startDownload?: ReturnType<typeof vi.fn>
    hasDownloadUi?: () => boolean
    gtagFn?: ReturnType<typeof vi.fn>
    getPagePath?: () => string
    baseUrl?: string
  } = {},
) {
  const whenReady = opts.whenReady ?? ((fn) => fn())
  const popover =
    opts.popover === undefined
      ? ({ querySelector: () => null } as unknown as HTMLElement)
      : opts.popover
  const startDownloadFn = opts.startDownload ?? vi.fn()
  let clickHandler: ((event: Event) => void) | undefined

  setupDownloadAdPopup({
    whenReady,
    hasDownloadUi: opts.hasDownloadUi ?? (() => true),
    getPopupElement: () => popover,
    findDownloadButton: () => (button ? (button as unknown as HTMLButtonElement) : null),
    addClickListener: (handler) => {
      clickHandler = handler
    },
    startDownload: startDownloadFn,
    gtagFn: opts.gtagFn,
    getPagePath: opts.getPagePath,
    baseUrl: opts.baseUrl,
  })

  return { startDownloadFn, triggerClick: () => clickHandler?.({ target: button } as Event) }
}

function makeDelegatingSetup(
  opts: {
    whenReady?: (fn: () => void) => void
    popover?: HTMLElement | null
    startDownload?: ReturnType<typeof vi.fn>
    hasDownloadUi?: () => boolean
    baseUrl?: string
  } = {},
) {
  const whenReady = opts.whenReady ?? ((fn) => fn())
  const popover =
    opts.popover === undefined
      ? ({ querySelector: () => null } as unknown as HTMLElement)
      : opts.popover
  const startDownloadFn = opts.startDownload ?? vi.fn()
  let clickHandler: ((event: Event) => void) | undefined

  setupDownloadAdPopup({
    whenReady,
    hasDownloadUi: opts.hasDownloadUi ?? (() => true),
    getPopupElement: () => popover,
    findDownloadButton: (target) => {
      if (!target || typeof target !== 'object' || !('closest' in target)) return null
      const button = (target as { closest: (selector: string) => unknown }).closest(DOWNLOAD_BUTTON_SELECTOR)
      return button instanceof Object ? (button as HTMLButtonElement) : null
    },
    addClickListener: (handler) => {
      clickHandler = handler
    },
    startDownload: startDownloadFn,
    baseUrl: opts.baseUrl ?? MULTI_LINK_BASE_URL,
  })

  return {
    startDownloadFn,
    triggerClick: (button: ReturnType<typeof makeClickableButton>) =>
      clickHandler?.({ target: button } as Event),
  }
}

describe('DownloadAdDialog', () => {
  it('renders required popover, fallback link, and AdSense elements with expected attributes', async () => {
    const html = await renderDownloadAdDialog()

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

describe('setupDownloadAdPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts the download without opening the popover in script', () => {
    const button = makeFakeButton('https://example.com/file.zip')
    const { startDownloadFn, triggerClick } = makeSetup(button)

    triggerClick()
    expect(startDownloadFn).toHaveBeenCalledWith('https://example.com/file.zip', '', false)
  })

  it('fires a file_download GA event when gtagFn is provided', () => {
    const button = {
      ...makeFakeButton('./test.pdf'),
      textContent: 'ダウンロード',
    }
    const gtagFn = vi.fn()
    const { triggerClick } = makeSetup(button, {
      gtagFn,
      getPagePath: () => '/essays/download-link',
      baseUrl: 'http://localhost:5173/essays/download-link',
    })

    triggerClick()

    expect(gtagFn).toHaveBeenCalledWith('event', FILE_DOWNLOAD_EVENT, {
      file_name: 'test.pdf',
      file_extension: 'pdf',
      link_url: 'http://localhost:5173/essays/test.pdf',
      link_text: 'ダウンロード',
      link_id: '/essays/download-link',
    })
  })

  it('does not fire GA events when gtagFn is omitted', () => {
    const button = makeFakeButton()
    const gtagFn = vi.fn()
    const { triggerClick } = makeSetup(button)

    triggerClick()
    expect(gtagFn).not.toHaveBeenCalled()
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

  it('does not attach listeners when the page has no download UI', () => {
    const button = makeFakeButton()
    const { startDownloadFn, triggerClick } = makeSetup(button, { hasDownloadUi: () => false })

    triggerClick()
    expect(startDownloadFn).not.toHaveBeenCalled()
  })

  it('starts the download for each button when multiple links share one popover', () => {
    const firstButton = makeClickableButton('./test.pdf')
    const secondButton = makeClickableButton('./test.pdf')
    const { startDownloadFn, triggerClick } = makeDelegatingSetup()

    triggerClick(firstButton)
    triggerClick(secondButton)

    const resolvedTestPdf = new URL('./test.pdf', MULTI_LINK_BASE_URL).href

    expect(startDownloadFn).toHaveBeenCalledTimes(2)
    expect(startDownloadFn).toHaveBeenNthCalledWith(1, resolvedTestPdf, '', false)
    expect(startDownloadFn).toHaveBeenNthCalledWith(2, resolvedTestPdf, '', false)
  })

  it('routes delegated clicks to the clicked download button', () => {
    const firstButton = makeClickableButton('./first.pdf')
    const secondButton = makeClickableButton('./second.pdf', { sameOrigin: false, newTab: true })
    const { startDownloadFn, triggerClick } = makeDelegatingSetup()

    triggerClick(secondButton)
    triggerClick(firstButton)

    expect(startDownloadFn).toHaveBeenNthCalledWith(1, new URL('./second.pdf', MULTI_LINK_BASE_URL).href, undefined, true)
    expect(startDownloadFn).toHaveBeenNthCalledWith(2, new URL('./first.pdf', MULTI_LINK_BASE_URL).href, '', false)
  })

  it('ignores clicks that are not on download buttons', () => {
    const unrelatedTarget = { closest: () => null }
    const { startDownloadFn, triggerClick } = makeDelegatingSetup()

    triggerClick(unrelatedTarget as unknown as ReturnType<typeof makeClickableButton>)
    expect(startDownloadFn).not.toHaveBeenCalled()
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