import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setupScrollDepthTracking } from './scrollDepthTracker'

type ScrollHandler = () => void

function makeOptions(scrollTop: number, maxScrollTop: number, opts?: { scheduleFrame?: (fn: () => void) => void }) {
  const gtagFn = vi.fn()
  let scrollHandler: ScrollHandler | undefined
  let frameCallback: (() => void) | undefined

  const scheduleFrame =
    opts?.scheduleFrame ??
    ((fn: () => void) => {
      frameCallback = fn
    })

  setupScrollDepthTracking({
    gtagFn,
    addScrollListener: (handler) => {
      scrollHandler = handler
    },
    getScrollPosition: () => ({ scrollTop, maxScrollTop }),
    scheduleFrame,
  })

  const triggerScroll = () => scrollHandler?.()
  const runFrame = () => frameCallback?.()

  return { gtagFn, triggerScroll, runFrame }
}

describe('setupScrollDepthTracking', () => {
  describe('fires scroll_depth events at scroll depth thresholds', () => {
    it.each([
      [25, 250, 1000],
      [50, 500, 1000],
      [75, 750, 1000],
      [90, 900, 1000],
      [100, 1000, 1000],
    ])('%i%%: scrollTop=%i, maxScrollTop=%i', (threshold, scrollTop, maxScrollTop) => {
      const { gtagFn, triggerScroll, runFrame } = makeOptions(scrollTop, maxScrollTop)
      triggerScroll()
      runFrame()
      expect(gtagFn).toHaveBeenCalledWith('event', 'scroll_depth', { percent_scrolled: threshold })
    })
  })

  it('fires all lower thresholds when scrolled past them in a single check', () => {
    const { gtagFn, triggerScroll, runFrame } = makeOptions(900, 1000)
    triggerScroll()
    runFrame()
    expect(gtagFn).toHaveBeenCalledTimes(4) // 25, 50, 75, 90
    expect(gtagFn).toHaveBeenCalledWith('event', 'scroll_depth', { percent_scrolled: 25 })
    expect(gtagFn).toHaveBeenCalledWith('event', 'scroll_depth', { percent_scrolled: 50 })
    expect(gtagFn).toHaveBeenCalledWith('event', 'scroll_depth', { percent_scrolled: 75 })
    expect(gtagFn).toHaveBeenCalledWith('event', 'scroll_depth', { percent_scrolled: 90 })
  })

  it('does not fire before any scroll event', () => {
    const { gtagFn } = makeOptions(500, 1000)
    expect(gtagFn).not.toHaveBeenCalled()
  })

  it('does not fire when scroll event is triggered but rAF has not run yet', () => {
    const { gtagFn, triggerScroll } = makeOptions(500, 1000)
    triggerScroll()
    expect(gtagFn).not.toHaveBeenCalled()
  })

  it('does not fire the same threshold twice', () => {
    const { gtagFn, triggerScroll, runFrame } = makeOptions(500, 1000)
    triggerScroll()
    runFrame()
    triggerScroll()
    runFrame()
    const calls = gtagFn.mock.calls.filter((c) => c[2]?.percent_scrolled === 50)
    expect(calls).toHaveLength(1)
  })

  it('does not fire when maxScrollTop is 0 (non-scrollable page)', () => {
    const { gtagFn, triggerScroll, runFrame } = makeOptions(0, 0)
    triggerScroll()
    runFrame()
    expect(gtagFn).not.toHaveBeenCalled()
  })

  it('does not fire below 25% threshold', () => {
    const { gtagFn, triggerScroll, runFrame } = makeOptions(240, 1000) // 24%
    triggerScroll()
    runFrame()
    expect(gtagFn).not.toHaveBeenCalled()
  })

  it('queues only one rAF when scroll fires multiple times before rAF runs', () => {
    const scheduleFrame = vi.fn()
    const { triggerScroll } = makeOptions(500, 1000, { scheduleFrame })
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

    const { triggerScroll } = makeOptions(250, 1000, { scheduleFrame })

    triggerScroll()
    expect(scheduleFrame).toHaveBeenCalledTimes(1)

    // complete the first rAF
    frameCallback?.()
    frameCallback = undefined

    // now a new scroll should queue another rAF
    triggerScroll()
    expect(scheduleFrame).toHaveBeenCalledTimes(2)
  })

  it('registers a scroll event listener via addScrollListener', () => {
    const gtagFn = vi.fn()
    const addScrollListener = vi.fn()
    setupScrollDepthTracking({
      gtagFn,
      addScrollListener,
      getScrollPosition: () => ({ scrollTop: 0, maxScrollTop: 1000 }),
      scheduleFrame: vi.fn(),
    })
    expect(addScrollListener).toHaveBeenCalledOnce()
    expect(typeof addScrollListener.mock.calls[0][0]).toBe('function')
  })

  describe('getScrollPosition is called at scroll time, not at setup time', () => {
    it('uses the position at the time of rAF, not setup', () => {
      const gtagFn = vi.fn()
      let scrollHandler: ScrollHandler | undefined
      let frameCallback: (() => void) | undefined
      let currentScrollTop = 0

      setupScrollDepthTracking({
        gtagFn,
        addScrollListener: (handler) => {
          scrollHandler = handler
        },
        getScrollPosition: () => ({ scrollTop: currentScrollTop, maxScrollTop: 1000 }),
        scheduleFrame: (fn) => {
          frameCallback = fn
        },
      })

      // At scroll time, position is 0%
      currentScrollTop = 0
      scrollHandler?.()

      // Position changes before rAF fires
      currentScrollTop = 500 // 50%

      frameCallback?.()

      expect(gtagFn).toHaveBeenCalledWith('event', 'scroll_depth', { percent_scrolled: 25 })
      expect(gtagFn).toHaveBeenCalledWith('event', 'scroll_depth', { percent_scrolled: 50 })
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })
})
