import type { GtagFn } from './scrollDepthTracker'

export interface MakamujoBannerTrackerOptions {
  gtagFn: GtagFn
  /** Calls `fn` once the DOM is ready to be queried (equivalent of DOMContentLoaded). */
  whenReady: (fn: () => void) => void
  /** Returns all `<area>` elements that carry a `data-gtag-event` attribute. */
  getAreaElements: () => HTMLAreaElement[]
  /** Opens the given URL (e.g. `window.open(href, '_blank', 'noopener,noreferrer')`). */
  navigate: (href: string) => void
  /** Maximum milliseconds to wait for the GA beacon before navigating anyway. */
  maxDelayMs?: number
}

/**
 * Intercepts clicks on Makamujo banner image-map `<area>` elements, fires a
 * GA4 event named by their `data-gtag-event` attribute, and then opens the
 * link.  Navigation is delayed until the event is confirmed sent, or until
 * `maxDelayMs` elapses — whichever comes first.
 */
export function setupMakamujoBannerTracking({
  gtagFn,
  whenReady,
  getAreaElements,
  navigate,
  maxDelayMs = 500,
}: MakamujoBannerTrackerOptions): void {
  whenReady(() => {
    for (const area of getAreaElements()) {
      const eventName = area.dataset.gtagEvent
      if (!eventName) continue

      area.addEventListener('click', (e) => {
        e.preventDefault()
        const href = area.href
        if (!href) return

        let navigated = false
        const doNavigate = () => {
          if (navigated) return
          navigated = true
          navigate(href)
        }

        // Fallback: navigate after maxDelayMs even if the GA beacon never fires.
        const timeout = setTimeout(doNavigate, maxDelayMs)

        gtagFn('event', eventName, {
          // Called by gtag once the event has been dispatched.
          event_callback: () => {
            clearTimeout(timeout)
            doNavigate()
          },
          // Tells gtag to call event_callback after at most maxDelayMs ms.
          event_timeout: maxDelayMs,
        })
      })
    }
  })
}
