import { createClient } from 'honox/client'
import { setupAdControl } from './lib/adControl'
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

setupAdControl({
  getHeaderElement: () => document.querySelector('header'),
  getHeaderAdElement: () => document.getElementById('header-ad'),
  getReferrer: () => document.referrer,
  addScrollListener: (handler) => window.addEventListener('scroll', handler, { passive: true }),
  getScrollPosition: () => ({
    scrollTop: window.scrollY || document.documentElement.scrollTop,
    maxScrollTop: document.documentElement.scrollHeight - document.documentElement.clientHeight,
  }),
  scheduleFrame: (fn) => requestAnimationFrame(fn),
  getFixedAdHeight: () => {
    // Look for a fixed-position element at the top of the viewport injected by the ad network.
    // Cache the result once a non-zero height is found (ad scripts load asynchronously).
    for (const el of document.body.children) {
      if (el instanceof HTMLElement) {
        const style = window.getComputedStyle(el)
        if (
          (style.position === 'fixed' || style.position === 'sticky') &&
          parseFloat(style.top) === 0
        ) {
          const height = el.getBoundingClientRect().height
          if (height > 0) return height
        }
      }
    }
    return 0
  },
})
