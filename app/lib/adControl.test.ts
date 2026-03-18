import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setupAdControl } from './adControl'

type ScrollHandler = () => void

function makeHeader() {
  return { style: { top: '0' } }
}

function makeHeaderAd() {
  return { hidden: false }
}

type FakeHeader = ReturnType<typeof makeHeader>
type FakeHeaderAd = ReturnType<typeof makeHeaderAd>

function makeOptions(
  opts: {
    referrer?: string
    scrollTop?: number
    maxScrollTop?: number
    fixedAdHeight?: number
    scheduleFrame?: (fn: () => void) => void
    header?: FakeHeader | null
    headerAd?: FakeHeaderAd | null
  } = {},
) {
  const header = opts.header !== undefined ? opts.header : makeHeader()
  const headerAd = opts.headerAd !== undefined ? opts.headerAd : makeHeaderAd()
  let scrollHandler: ScrollHandler | undefined
  let frameCallback: (() => void) | undefined

  const scheduleFrame =
    opts.scheduleFrame ??
    ((fn: () => void) => {
      frameCallback = fn
    })

  setupAdControl({
    getHeaderElement: () => header as unknown as HTMLElement | null,
    getHeaderAdElement: () => headerAd as unknown as HTMLElement | null,
    getReferrer: () => opts.referrer ?? '',
    addScrollListener: (handler) => {
      scrollHandler = handler
    },
    getScrollPosition: () => ({
      scrollTop: opts.scrollTop ?? 0,
      maxScrollTop: opts.maxScrollTop ?? 1000,
    }),
    scheduleFrame,
    getFixedAdHeight: () => opts.fixedAdHeight ?? 50,
  })

  const triggerScroll = () => scrollHandler?.()
  const runFrame = () => frameCallback?.()

  return { header, headerAd, triggerScroll, runFrame }
}

describe('setupAdControl', () => {
  describe('Feature 1: hide header ad for t.co referrals', () => {
    it('hides the header ad when referrer hostname is t.co', () => {
      const { headerAd } = makeOptions({ referrer: 'https://t.co/abc123' })
      expect(headerAd.hidden).toBe(true)
    })

    it('does not hide the header ad when referrer is from a different host', () => {
      const { headerAd } = makeOptions({ referrer: 'https://example.com/' })
      expect(headerAd.hidden).toBe(false)
    })

    it('does not hide the header ad when referrer is empty', () => {
      const { headerAd } = makeOptions({ referrer: '' })
      expect(headerAd.hidden).toBe(false)
    })

    it('does not throw when the header ad element does not exist', () => {
      expect(() => makeOptions({ referrer: 'https://t.co/abc123', headerAd: null })).not.toThrow()
    })

    it('does not throw on an invalid referrer URL', () => {
      expect(() => makeOptions({ referrer: 'not-a-url' })).not.toThrow()
    })
  })

  describe('Feature 2: lower header top at page bottom to avoid fixed-ad overlap', () => {
    it('sets header top to fixedAdHeight when at page bottom', () => {
      const { header, triggerScroll, runFrame } = makeOptions({
        scrollTop: 1000,
        maxScrollTop: 1000,
        fixedAdHeight: 60,
      })
      triggerScroll()
      runFrame()
      expect(header.style.top).toBe('60px')
    })

    it('resets header top to 0 when not at page bottom', () => {
      const { header, triggerScroll, runFrame } = makeOptions({
        scrollTop: 500,
        maxScrollTop: 1000,
        fixedAdHeight: 60,
      })
      // First, put it in the "at bottom" state
      header.style.top = '60px'
      triggerScroll()
      runFrame()
      expect(header.style.top).toBe('0')
    })

    it('does not adjust header top when maxScrollTop is 0 (non-scrollable)', () => {
      const { header, triggerScroll, runFrame } = makeOptions({
        scrollTop: 0,
        maxScrollTop: 0,
        fixedAdHeight: 60,
      })
      header.style.top = '60px'
      triggerScroll()
      runFrame()
      // Should not change (stays at '60px') because non-scrollable pages are skipped
      expect(header.style.top).toBe('60px')
    })

    it('does not modify the header when the header element does not exist', () => {
      expect(() => {
        const { triggerScroll, runFrame } = makeOptions({ header: null })
        triggerScroll()
        runFrame()
      }).not.toThrow()
    })

    it('queues only one rAF when scroll fires multiple times before rAF runs', () => {
      const scheduleFrame = vi.fn()
      const { triggerScroll } = makeOptions({ scheduleFrame })
      triggerScroll()
      triggerScroll()
      triggerScroll()
      expect(scheduleFrame).toHaveBeenCalledTimes(1)
    })

    it('allows a new rAF to be queued after the previous one completes', () => {
      const scheduleFrame = vi.fn()
      let frameCallback: (() => void) | undefined
      scheduleFrame.mockImplementation((fn: () => void) => {
        frameCallback = fn
      })
      const { triggerScroll } = makeOptions({ scheduleFrame })
      triggerScroll()
      expect(scheduleFrame).toHaveBeenCalledTimes(1)
      frameCallback?.()
      frameCallback = undefined
      triggerScroll()
      expect(scheduleFrame).toHaveBeenCalledTimes(2)
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })
})
