export interface AdControlOptions {
  /** Returns the sticky header element. */
  getHeaderElement: () => HTMLElement | null
  /** Returns the header ad element to hide when referred from t.co. */
  getHeaderAdElement: () => HTMLElement | null
  /** Returns the current page referrer (e.g. `document.referrer`). */
  getReferrer: () => string
  /** Calls `fn` once the DOM is ready to be queried (equivalent of DOMContentLoaded). */
  whenReady: (fn: () => void) => void
  /** Registers a scroll event listener. */
  addScrollListener: (handler: () => void) => void
  /** Returns the current scroll position. */
  getScrollPosition: () => { scrollTop: number; maxScrollTop: number }
  /** Schedules a callback via requestAnimationFrame or equivalent. */
  scheduleFrame: (fn: () => void) => void
  /** Returns the height (in px) of any fixed ad sitting above the header. */
  getFixedAdHeight: () => number
}

/**
 * Sets up ad-related behaviour on the client:
 *
 * 1. Hides the header ad when the page is referred from t.co (Twitter short-link).
 * 2. Lowers the sticky header's `top` offset by the height of any fixed overlay
 *    ad when the user reaches the bottom of the page, so the header is not
 *    obscured by the ad.
 */
export function setupAdControl({
  getHeaderElement,
  getHeaderAdElement,
  getReferrer,
  whenReady,
  addScrollListener,
  getScrollPosition,
  scheduleFrame,
  getFixedAdHeight,
}: AdControlOptions): void {
  // Feature 1: hide header ad for t.co referrals.
  // Deferred until the DOM is ready so the element is guaranteed to exist.
  whenReady(() => {
    try {
      const referrer = getReferrer()
      if (referrer && new URL(referrer).hostname === 't.co') {
        const headerAd = getHeaderAdElement()
        if (headerAd) {
          headerAd.hidden = true
        }
      }
    } catch {
      // Ignore invalid referrer URLs
    }
  })

  // Feature 2: adjust header top when at page bottom to avoid fixed-ad overlap
  let ticking = false
  addScrollListener(() => {
    if (!ticking) {
      ticking = true
      scheduleFrame(() => {
        const { scrollTop, maxScrollTop } = getScrollPosition()
        const atBottom = maxScrollTop > 0 && scrollTop >= maxScrollTop
        const header = getHeaderElement()
        if (header && maxScrollTop > 0) {
          header.style.top = atBottom ? `${getFixedAdHeight()}px` : '0'
        }
        ticking = false
      })
    }
  })
}
