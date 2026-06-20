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
  addEventListener: (event: string, handler: (e: Event) => void) => void
  triggerClick: () => { preventDefault: ReturnType<typeof vi.fn> }
}

function makeFakeButton(
  href = 'https://example.com/file.zip',
  opts: { sameOrigin?: boolean; newTab?: boolean } = {},
): FakeButton {
  const { sameOrigin = true, newTab = false } = opts
  let clickHandler: ((e: Event) => void) | undefined
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
    addEventListener: (event, handler) => {
      if (event === 'click') clickHandler = handler
    },
    triggerClick: () => {
      const e = { preventDefault: vi.fn() }
      clickHandler?.(e as unknown as Event)
      return e
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
  buttons: FakeButton[],
  opts: {
    whenReady?: (fn: () => void) => void
    popover?: ReturnType<typeof makeFakePopover> | null
    startDownload?: ReturnType<typeof vi.fn>
  } = {},
) {
  const whenReady = opts.whenReady ?? ((fn) => fn())
  const popover = opts.popover === undefined ? makeFakePopover() : opts.popover
  const startDownloadFn = opts.startDownload ?? vi.fn()

  setupDownloadAdPopup({
    whenReady,
    getDownloadButtons: () => buttons as unknown as HTMLButtonElement[],
    getPopupElement: () => popover as unknown as HTMLElement | null,
    startDownload: startDownloadFn,
  })

  return { popover, startDownloadFn }
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

  it('updates the fallback link and starts the download on button click', () => {
    const button = makeFakeButton('https://example.com/file.zip')
    const { popover, startDownloadFn } = makeSetup([button])

    const { preventDefault } = button.triggerClick()
    expect(preventDefault).not.toHaveBeenCalled()
    expect(popover?.fallback.href).toBe('https://example.com/file.zip')
    expect(startDownloadFn).toHaveBeenCalledWith('https://example.com/file.zip', '', false)
  })

  it('opens cross-origin downloads in a new tab', () => {
    const button = makeFakeButton('https://example.com/file.zip', { sameOrigin: false, newTab: true })
    const { startDownloadFn } = makeSetup([button])

    button.triggerClick()
    expect(startDownloadFn).toHaveBeenCalledWith('https://example.com/file.zip', undefined, true)
  })

  it('does nothing when the pre-rendered popover is missing', () => {
    const button = makeFakeButton()
    const { startDownloadFn } = makeSetup([button], { popover: null })

    button.triggerClick()
    expect(startDownloadFn).not.toHaveBeenCalled()
  })

  it('does not attach listeners before whenReady fires', () => {
    let readyFn: (() => void) | undefined
    const button = makeFakeButton()
    const { startDownloadFn } = makeSetup([button], {
      whenReady: (fn) => {
        readyFn = fn
      },
    })

    button.triggerClick()
    expect(startDownloadFn).not.toHaveBeenCalled()
    readyFn?.()
    button.triggerClick()
    expect(startDownloadFn).toHaveBeenCalledOnce()
  })
})