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

function makeFakeDialog() {
  const fallback = {
    href: '#',
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
    showModal: vi.fn(),
    querySelector: (selector: string) => (selector === `#${DOWNLOAD_AD_FALLBACK_ID}` ? fallback : null),
    fallback,
  }
}

function makeSetup(
  links: FakeLink[],
  opts: {
    whenReady?: (fn: () => void) => void
    dialog?: ReturnType<typeof makeFakeDialog> | null
    showPopup?: ReturnType<typeof vi.fn>
  } = {},
) {
  const showPopup = opts.showPopup ?? vi.fn()
  const whenReady = opts.whenReady ?? ((fn) => fn())
  const dialog = opts.dialog === undefined ? makeFakeDialog() : opts.dialog

  setupDownloadAdPopup({
    whenReady,
    getDownloadLinks: () => links as unknown as HTMLAnchorElement[],
    getPopupDialog: () => dialog as unknown as HTMLDialogElement | null,
    showPopup: showPopup as never,
  })

  return { showPopup, dialog }
}

describe('prepareDownloadAdPopup', () => {
  it('updates the fallback link href and download attribute', () => {
    const dialog = makeFakeDialog()
    prepareDownloadAdPopup(dialog as unknown as HTMLDialogElement, 'https://example.com/test.pdf', '')
    expect(dialog.fallback.href).toBe('https://example.com/test.pdf')
    expect(dialog.fallback.download).toBe('')
  })
})

describe('setupDownloadAdPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not block the native download and opens the pre-rendered dialog on click', () => {
    const link = makeFakeLink()
    const { showPopup, dialog } = makeSetup([link])

    const { preventDefault } = link.triggerClick()
    expect(preventDefault).not.toHaveBeenCalled()
    expect(dialog?.fallback.href).toBe('https://example.com/file.zip')
    expect(showPopup).toHaveBeenCalledOnce()
  })

  it('does nothing when the pre-rendered dialog is missing', () => {
    const link = makeFakeLink()
    const { showPopup } = makeSetup([link], { dialog: null })

    link.triggerClick()
    expect(showPopup).not.toHaveBeenCalled()
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