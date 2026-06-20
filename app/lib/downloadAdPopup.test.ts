import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DOWNLOAD_AD_FALLBACK_ID } from './downloadAdMarkup'
import {
  DOWNLOAD_ATTR_DATA_ATTR,
  DOWNLOAD_HREF_DATA_ATTR,
  DOWNLOAD_NEW_TAB_DATA_ATTR,
} from './rehypeDownloadLinks'
import { prepareDownloadAdPopup, resolveDownloadHref, setupDownloadAdPopup } from './downloadAdPopup'

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

  it('does nothing when the pre-rendered popover is missing', () => {
    const button = makeFakeButton()
    const { startDownloadFn, triggerClick } = makeSetup(button, { popover: null })

    triggerClick()
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