import { createClient } from 'honox/client'
import { type GtagFn, setupScrollDepthTracking } from './lib/scrollDepthTracker'

createClient()

if (import.meta.env.PROD) {
  setupScrollDepthTracking({
    gtagFn: (command, name, params) => {
      const gtag = (window as Window & { gtag?: GtagFn }).gtag
      gtag?.(command, name, params)
    },
    addScrollListener: (handler) => window.addEventListener('scroll', handler, { passive: true }),
    getScrollPosition: () => ({
      scrollTop: window.scrollY || document.documentElement.scrollTop,
      scrollHeight: document.documentElement.scrollHeight - document.documentElement.clientHeight,
    }),
    scheduleFrame: (fn) => requestAnimationFrame(fn),
  })
}
