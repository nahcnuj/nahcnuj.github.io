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

  const trigger = { click: vi.fn() }

  return {
    querySelector: (selector: string) => (selector === `#${DOWNLOAD_AD_FALLBACK_ID}` ? fallback : null),
    fallback,
    trigger,
  }
}

function makeSetup(
  links: FakeLink[],
  opts: {
    whenReady?: (fn: () => void) => void
    popover?: ReturnType<typeof makeFakePopover> | null
    showPopup?: ReturnType<typeof vi.fn>
  } = {},
) {
  const showPopup = opts.showPopup ?? vi.fn()
  const whenReady = opts.whenReady ?? ((fn) => fn())
  const popover = opts.popover === undefined ? makeFakePopover() : opts.popover

  setupDownloadAdPopup({
    whenReady,
    getDownloadLinks: () => links as unknown as HTMLAnchorElement[],
    getPopupElement: () => popover as unknown as HTMLElement | null,
    getShowTrigger: () => (popover ? popover.trigger : null) as unknown as HTMLButtonElement | null,
    showPopup: showPopup as never,
  })

  return { showPopup, popover }
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
    const { showPopup, popover } = makeSetup([link])

    const { preventDefault } = link.triggerClick()
    expect(preventDefault).not.toHaveBeenCalled()
    expect(popover?.fallback.href).toBe('https://example.com/file.zip')
    expect(showPopup).toHaveBeenCalledOnce()
  })

  it('does nothing when the pre-rendered popover is missing', () => {
    const link = makeFakeLink()
    const { showPopup } = makeSetup([link], { popover: null })

    link.triggerClick()
    expect(showPopup).not.toHaveBeenCalled()
  })

  it('clicks the declarative show trigger by default', () => {
    const link = makeFakeLink()
    const popover = makeFakePopover()

    setupDownloadAdPopup({
      whenReady: (fn) => fn(),
      getDownloadLinks: () => [link as unknown as HTMLAnchorElement],
      getPopupElement: () => popover as unknown as HTMLElement,
      getShowTrigger: () => popover.trigger as unknown as HTMLButtonElement,
    })

    link.triggerClick()
    expect(popover.trigger.click).toHaveBeenCalledOnce()
  })

  it('does not attach listeners before whenReady fires', () => {
    let readyFn: (() => void) | undefined
    const link = makeFakeLink()
    const { showPopup } = makeSetup([link], {
      whenReady: (fn) => {
        readyFn = fn
      },
    })

    link.triggerClick()
    expect(showPopup).not.toHaveBeenCalled()
    readyFn?.()
    link.triggerClick()
    expect(showPopup).toHaveBeenCalledOnce()
  })
})