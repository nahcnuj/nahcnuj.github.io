export type GtagFn = (command: string, name: string, params?: Record<string, unknown>) => void

export interface ScrollDepthTrackerOptions {
  gtagFn: GtagFn
  addScrollListener: (handler: () => void) => void
  getScrollPosition: () => { scrollTop: number; scrollHeight: number }
  scheduleFrame: (fn: () => void) => void
}

export function setupScrollDepthTracking({
  gtagFn,
  addScrollListener,
  getScrollPosition,
  scheduleFrame,
}: ScrollDepthTrackerOptions): void {
  const thresholds = [25, 50, 75, 90, 100]
  const fired: Record<number, boolean> = {}
  let ticking = false

  function checkScrollDepth() {
    const { scrollTop, scrollHeight } = getScrollPosition()
    if (scrollHeight > 0) {
      const percent = Math.round((scrollTop / scrollHeight) * 100)
      for (const threshold of thresholds) {
        if (percent >= threshold && !fired[threshold]) {
          fired[threshold] = true
          gtagFn('event', 'scroll_depth', { percent_scrolled: threshold })
        }
      }
    }
    ticking = false
  }

  addScrollListener(() => {
    if (!ticking) {
      ticking = true
      scheduleFrame(checkScrollDepth)
    }
  })
}
