import { createClient } from 'honox/client'
import { type GtagFn, setupScrollDepthTracking } from './lib/scrollDepthTracker'

createClient()

const gtagFn: GtagFn = import.meta.env.PROD
  ? (command, name, params) => {
      const w = window as Window & { gtag?: GtagFn; dataLayer?: unknown[] }
      // Ensure dataLayer exists to buffer events before gtag.js finishes loading
      w.dataLayer = w.dataLayer || []
      if (w.gtag) {
        w.gtag(command, name, params)
      } else {
        // gtag.js processes array-like items from dataLayer when it initializes
        w.dataLayer.push([command, name, params])
      }
    }
  : (command, name, params) => {
      console.log('[scroll_depth]', command, name, params)
    }

setupScrollDepthTracking({
  gtagFn,
  addScrollListener: (handler) => window.addEventListener('scroll', handler, { passive: true }),
  getScrollPosition: () => ({
    scrollTop: window.scrollY || document.documentElement.scrollTop,
    maxScrollTop: document.documentElement.scrollHeight - document.documentElement.clientHeight,
  }),
  scheduleFrame: (fn) => requestAnimationFrame(fn),
})
