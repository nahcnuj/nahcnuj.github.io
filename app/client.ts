import { createClient } from 'honox/client'
import { setupAdControl } from './lib/adControl'
import { setupDownloadAdPopup } from './components/DownloadAdDialog'
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

interface Twq {
  (...args: unknown[]): void
  queue?: unknown[][]
}

const xPixelFn = import.meta.env.PROD
  ? () => {
      const w = window as Window & { twq?: Twq }
      if (typeof w.twq === 'function') {
        w.twq('event', 'tw-ov0j6-ov0j9', {})
      } else {
        // Initialize stub + queue if the base X pixel script (uwt.js) has not loaded yet.
        // Mirrors the queuing behavior of the X base IIFE so early calls are not lost.
        const queue: unknown[][] = []
        const stub: Twq = (...args: unknown[]) => {
          queue.push(args)
        }
        stub.queue = queue
        w.twq = stub
        stub('event', 'tw-ov0j6-ov0j9', {})
      }
    }
  : () => {
      console.log('[x-pixel]', 'event', 'tw-ov0j6-ov0j9', {})
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

setupDownloadAdPopup({ whenReady, gtagFn, xPixelFn })
