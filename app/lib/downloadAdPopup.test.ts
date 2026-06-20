import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DOWNLOAD_AD_FALLBACK_ID } from './downloadAdMarkup'
import { prepareDownloadAdPopup, setupDownloadAdPopup } from './downloadAdPopup'

type FakeLink = {
  href?: string
  getAttribute: (name: string) => string | null
  addEventListener: (event: string, handler: (e: Event) => void) => void
  triggerClick: () => { preventDefault: ReturnType<typeof vi.fn> }
}

function makeFakeLink(href = 'https://example.com/file.zip', download: string | null = ''): FakeLink {
  let clickHandler: ((e: Event) => void) | undefined
  return {
    href,
    getAttribute: (name) => (name === 'download' ? download : null),
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
    showPopover: vi.fn(),
    querySelector: (selector: string) => (selector === `#${DOWNLOAD_AD_FALLBACK_ID}` ? fallback : null),
    fallback,
  }
}

function makeSetup(
  links: FakeLink[],
  opts: {
    whenReady?: (fn: () => void) => void
    popover?: ReturnType<typeof makeFakePopover> | null
  } = {},
) {
  const whenReady = opts.whenReady ?? ((fn) => fn())
  const popover = opts.popover === undefined ? makeFakePopover() : opts.popover

  setupDownloadAdPopup({
    whenReady,
    getDownloadLinks: () => links as unknown as HTMLAnchorElement[],
    getPopupElement: () => popover as unknown as HTMLElement | null,
  })

  return { popover }
}

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

  it('does not block the native download and opens the popover on click', () => {
    const link = makeFakeLink()
    const { popover } = makeSetup([link])

    const { preventDefault } = link.triggerClick()
    expect(preventDefault).not.toHaveBeenCalled()
    expect(popover?.fallback.href).toBe('https://example.com/file.zip')
    expect(popover?.showPopover).toHaveBeenCalledOnce()
  })

  it('does nothing when the pre-rendered popover is missing', () => {
    const link = makeFakeLink()
    makeSetup([link], { popover: null })

    expect(() => link.triggerClick()).not.toThrow()
  })

  it('does not attach listeners before whenReady fires', () => {
    let readyFn: (() => void) | undefined
    const link = makeFakeLink()
    const { popover } = makeSetup([link], {
      whenReady: (fn) => {
        readyFn = fn
      },
    })

    link.triggerClick()
    expect(popover?.showPopover).not.toHaveBeenCalled()
    readyFn?.()
    link.triggerClick()
    expect(popover?.showPopover).toHaveBeenCalledOnce()
  })
})