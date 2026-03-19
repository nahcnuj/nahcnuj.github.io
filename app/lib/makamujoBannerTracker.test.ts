import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setupMakamujoBannerTracking } from './makamujoBannerTracker'
import type { GtagFn } from './scrollDepthTracker'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type FakeArea = {
  dataset: { gtagEvent?: string }
  href: string
  addEventListener: (event: string, handler: (e: Event) => void) => void
  /** Simulate a user click on this area element. */
  triggerClick: () => { preventDefault: ReturnType<typeof vi.fn> }
}

function makeFakeArea(gtagEvent: string | undefined, href: string): FakeArea {
  let clickHandler: ((e: Event) => void) | undefined
  return {
    dataset: { gtagEvent },
    href,
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

function makeSetup(
  areas: FakeArea[],
  opts: {
    navigate?: ReturnType<typeof vi.fn>
    maxDelayMs?: number
    gtag?: GtagFn
    whenReady?: (fn: () => void) => void
  } = {},
) {
  const navigate = opts.navigate ?? vi.fn()
  const gtag = opts.gtag ?? vi.fn()
  const whenReady = opts.whenReady ?? ((fn) => fn())

  setupMakamujoBannerTracking({
    gtagFn: gtag as GtagFn,
    whenReady,
    getAreaElements: () => areas as unknown as HTMLAreaElement[],
    navigate,
    maxDelayMs: opts.maxDelayMs ?? 500,
  })

  return { navigate, gtag }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('setupMakamujoBannerTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('GA event name', () => {
    it('fires "click_makamujo_nicovideo" when the NicoNico badge area is clicked', () => {
      const area = makeFakeArea('click_makamujo_nicovideo', 'https://live.nicovideo.jp/watch/user/14171889')
      const { gtag } = makeSetup([area])
      area.triggerClick()
      expect(gtag).toHaveBeenCalledWith('event', 'click_makamujo_nicovideo', expect.any(Object))
    })

    it('fires "click_makamujo_landing" when the landing-page area is clicked', () => {
      const area = makeFakeArea('click_makamujo_landing', 'https://www.nahcnuj.work/makamujo/index.html')
      const { gtag } = makeSetup([area])
      area.triggerClick()
      expect(gtag).toHaveBeenCalledWith('event', 'click_makamujo_landing', expect.any(Object))
    })

    it('passes event_timeout equal to maxDelayMs', () => {
      const area = makeFakeArea('click_makamujo_nicovideo', 'https://live.nicovideo.jp/watch/user/14171889')
      const { gtag } = makeSetup([area], { maxDelayMs: 300 })
      area.triggerClick()
      expect(gtag).toHaveBeenCalledWith(
        'event',
        'click_makamujo_nicovideo',
        expect.objectContaining({ event_timeout: 300 }),
      )
    })
  })

  describe('navigation via event_callback', () => {
    it('does not navigate immediately after click (waits for GA callback)', () => {
      const area = makeFakeArea('click_makamujo_nicovideo', 'https://live.nicovideo.jp/watch/user/14171889')
      const { navigate } = makeSetup([area])
      area.triggerClick()
      expect(navigate).not.toHaveBeenCalled()
    })

    it('navigates to the correct URL when event_callback fires', () => {
      const href = 'https://live.nicovideo.jp/watch/user/14171889'
      const area = makeFakeArea('click_makamujo_nicovideo', href)
      let capturedCallback: (() => void) | undefined
      const gtag = vi.fn().mockImplementation((_cmd, _name, params: Record<string, unknown>) => {
        capturedCallback = params?.event_callback as () => void
      })
      const { navigate } = makeSetup([area], { gtag })
      area.triggerClick()
      capturedCallback?.()
      expect(navigate).toHaveBeenCalledWith(href)
    })
  })

  describe('navigation via timeout fallback', () => {
    it('navigates after maxDelayMs when event_callback never fires', () => {
      const href = 'https://www.nahcnuj.work/makamujo/index.html'
      const area = makeFakeArea('click_makamujo_landing', href)
      const gtag = vi.fn() // never calls event_callback
      const { navigate } = makeSetup([area], { gtag, maxDelayMs: 300 })
      area.triggerClick()
      expect(navigate).not.toHaveBeenCalled()
      vi.advanceTimersByTime(300)
      expect(navigate).toHaveBeenCalledWith(href)
    })

    it('does not navigate before maxDelayMs elapses', () => {
      const area = makeFakeArea('click_makamujo_landing', 'https://www.nahcnuj.work/makamujo/index.html')
      const gtag = vi.fn()
      const { navigate } = makeSetup([area], { gtag, maxDelayMs: 300 })
      area.triggerClick()
      vi.advanceTimersByTime(299)
      expect(navigate).not.toHaveBeenCalled()
    })
  })

  describe('no double navigation', () => {
    it('navigates exactly once even when both event_callback and timeout fire', () => {
      const href = 'https://live.nicovideo.jp/watch/user/14171889'
      const area = makeFakeArea('click_makamujo_nicovideo', href)
      let capturedCallback: (() => void) | undefined
      const gtag = vi.fn().mockImplementation((_cmd, _name, params: Record<string, unknown>) => {
        capturedCallback = params?.event_callback as () => void
      })
      const { navigate } = makeSetup([area], { gtag, maxDelayMs: 300 })
      area.triggerClick()
      capturedCallback?.() // fires callback first
      vi.advanceTimersByTime(300) // then timeout fires
      expect(navigate).toHaveBeenCalledTimes(1)
    })

    it('navigates exactly once when timeout fires before event_callback', () => {
      const href = 'https://live.nicovideo.jp/watch/user/14171889'
      const area = makeFakeArea('click_makamujo_nicovideo', href)
      let capturedCallback: (() => void) | undefined
      const gtag = vi.fn().mockImplementation((_cmd, _name, params: Record<string, unknown>) => {
        capturedCallback = params?.event_callback as () => void
      })
      const { navigate } = makeSetup([area], { gtag, maxDelayMs: 300 })
      area.triggerClick()
      vi.advanceTimersByTime(300) // timeout fires first
      capturedCallback?.() // then callback fires
      expect(navigate).toHaveBeenCalledTimes(1)
    })
  })

  describe('default prevention', () => {
    it('calls preventDefault on the click event to stop native area navigation', () => {
      const area = makeFakeArea('click_makamujo_nicovideo', 'https://live.nicovideo.jp/watch/user/14171889')
      makeSetup([area])
      const { preventDefault } = area.triggerClick()
      expect(preventDefault).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('skips areas without a data-gtag-event attribute', () => {
      const area = makeFakeArea(undefined, 'https://example.com')
      const { gtag, navigate } = makeSetup([area])
      area.triggerClick()
      vi.advanceTimersByTime(500)
      expect(gtag).not.toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
    })

    it('does not attach listeners before whenReady fires', () => {
      let readyFn: (() => void) | undefined
      const area = makeFakeArea('click_makamujo_nicovideo', 'https://live.nicovideo.jp/watch/user/14171889')
      const { gtag } = makeSetup([area], {
        whenReady: (fn) => {
          readyFn = fn
        },
      })
      area.triggerClick()
      expect(gtag).not.toHaveBeenCalled()
      readyFn?.()
      area.triggerClick()
      expect(gtag).toHaveBeenCalledOnce()
    })

    it('handles multiple areas independently', () => {
      const area1 = makeFakeArea('click_makamujo_nicovideo', 'https://live.nicovideo.jp/watch/user/14171889')
      const area2 = makeFakeArea('click_makamujo_landing', 'https://www.nahcnuj.work/makamujo/index.html')
      const gtag = vi.fn()
      makeSetup([area1, area2], { gtag })
      area1.triggerClick()
      area2.triggerClick()
      expect(gtag).toHaveBeenCalledTimes(2)
      expect(gtag).toHaveBeenNthCalledWith(1, 'event', 'click_makamujo_nicovideo', expect.any(Object))
      expect(gtag).toHaveBeenNthCalledWith(2, 'event', 'click_makamujo_landing', expect.any(Object))
    })
  })
})
