import { createClient } from 'honox/client'
import { type GtagFn, setupScrollDepthTracking } from './lib/scrollDepthTracker'

createClient()

const gtagFn: GtagFn = import.meta.env.PROD
  ? (command, name, params) => {
      const gtag = (window as Window & { gtag?: GtagFn }).gtag
      gtag?.(command, name, params)
    }
  : (command, name, params) => {
      console.log('[scroll_depth]', command, name, params)
    }

setupScrollDepthTracking({
  gtagFn,
  addScrollListener: (handler) => window.addEventListener('scroll', handler, { passive: true }),
  getScrollPosition: () => ({
    scrollTop: window.scrollY || document.documentElement.scrollTop,
    scrollHeight: document.documentElement.scrollHeight - document.documentElement.clientHeight,
  }),
  scheduleFrame: (fn) => requestAnimationFrame(fn),
})
