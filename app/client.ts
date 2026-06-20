import { createClient } from 'honox/client'
import { setupAdControl } from './lib/adControl'
import {
  DOWNLOAD_AD_POPUP_SELECTOR,
  DOWNLOAD_LINK_SELECTOR,
  setupDownloadAdPopup,
} from './lib/downloadAdPopup'
import { setupMakamujoBannerTracking } from './lib/makamujoBannerTracker'
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
      console.log('[gtag]', command, name, params)
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
  whenReady: (fn) => {
    if (document.readyState !== 'loading') {
      fn()
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true })
    }
  },
  addScrollListener: (handler) => window.addEventListener('scroll', handler, { passive: true }),
  getScrollPosition: () => ({
    scrollTop: window.scrollY || document.documentElement.scrollTop,
    maxScrollTop: document.documentElement.scrollHeight - document.documentElement.clientHeight,
  }),
  scheduleFrame: (fn) => requestAnimationFrame(fn),
  getFixedAdHeight: () => {
    // Look for a fixed-position element at the top-left of the viewport injected by the ad network.
    // Requiring left === 0 excludes any fixed/sticky element anchored to the right side of the viewport.
    for (const el of document.body.children) {
      if (el instanceof HTMLElement) {
        const style = window.getComputedStyle(el)
        if (style.position === 'fixed' || style.position === 'sticky') {
          const rect = el.getBoundingClientRect()
          if (parseFloat(style.top) === 0 && rect.left === 0) {
            if (rect.height > 0) return rect.height
          }
        }
      }
    }
    return 0
  },
})

const whenReady = (fn: () => void) => {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn, { once: true })
  }
}

setupMakamujoBannerTracking({
  gtagFn,
  whenReady,
  getAreaElements: () => Array.from(document.querySelectorAll<HTMLAreaElement>('area[data-gtag-event]')),
  navigate: (href) => window.open(href, '_blank', 'noopener,noreferrer'),
  maxDelayMs: 500,
})

setupDownloadAdPopup({
  whenReady,
  getDownloadButtons: () => Array.from(document.querySelectorAll<HTMLButtonElement>(DOWNLOAD_LINK_SELECTOR)),
  getPopupElement: () => document.querySelector<HTMLElement>(DOWNLOAD_AD_POPUP_SELECTOR),
})
