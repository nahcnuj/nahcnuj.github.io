import { html } from 'hono/html'
import { trackFileDownload } from '../lib/downloadTracker'
import type { GtagFn } from '../lib/scrollDepthTracker'
import { ADSENSE_CLIENT_ID, DOWNLOAD_AD_SLOT } from '../lib/site'
import {
  DOWNLOAD_AD_DATA_ATTR,
  DOWNLOAD_AD_POPUP_ID,
  DOWNLOAD_ATTR_DATA_ATTR,
  DOWNLOAD_HREF_DATA_ATTR,
  DOWNLOAD_NEW_TAB_DATA_ATTR,
} from '../lib/downloadLinkPlugin'

export const DOWNLOAD_AD_FALLBACK_ID = 'download-ad-fallback'

export const DOWNLOAD_DIALOG_LABEL = 'ダウンロード時の広告'
export const DOWNLOAD_DIALOG_CLASS = 'download-ad-dialog'
export const DOWNLOAD_FALLBACK_LINK_TEXT = '自動でダウンロードされない場合はこちらをクリックしてください'

export const DOWNLOAD_LINK_SELECTOR = `button[${DOWNLOAD_AD_DATA_ATTR}]`
export const DOWNLOAD_AD_POPUP_SELECTOR = `[popover]#${DOWNLOAD_AD_POPUP_ID}`

export interface DownloadAdPopupOptions {
  /** Calls `fn` once the DOM is ready to be queried. */
  whenReady: (fn: () => void) => void
  /** Starts a file download (buttons cannot download natively). */
  startDownload?: (href: string, download?: string, newTab?: boolean) => void
  /** @internal Test override for the pre-rendered popover element. */
  getPopupElement?: () => HTMLElement | null
  /** @internal Test override for resolving a clicked download button. */
  findDownloadButton?: (target: EventTarget | null) => HTMLButtonElement | null
  /** @internal Test override for registering the delegated click handler. */
  addClickListener?: (handler: (event: Event) => void) => void
  /** @internal Test override for whether the page includes download-popup markup. */
  hasDownloadUi?: () => boolean
  /** @internal Test override for resolving relative `data-download-href` values. */
  baseUrl?: string
  /** Sends GA4 `file_download` events when a download button is clicked. */
  gtagFn?: GtagFn
  /** @internal Test override for the current page path sent as `link_id`. */
  getPagePath?: () => string
}

function defaultHasDownloadUi(): boolean {
  if (typeof document === 'undefined') return false
  return (
    document.querySelector(DOWNLOAD_LINK_SELECTOR) !== null ||
    document.querySelector(DOWNLOAD_AD_POPUP_SELECTOR) !== null
  )
}

/** Resolves a button's `data-download-href` against the current document URL. */
export function resolveDownloadHref(button: HTMLButtonElement, baseUrl?: string): string {
  const href = button.getAttribute(DOWNLOAD_HREF_DATA_ATTR)
  if (!href) return ''
  const base = baseUrl ?? (typeof document !== 'undefined' ? document.baseURI : 'https://www.nahcnuj.work/')
  try {
    return new URL(href, base).href
  } catch {
    return href
  }
}

/** Resolves the `download` attribute value; empty string means "use the URL filename". */
export function resolveDownloadFilename(href: string, download?: string): string | undefined {
  if (download === undefined) return undefined
  if (download.length > 0) return download

  try {
    const base = typeof document !== 'undefined' ? document.baseURI : 'https://www.nahcnuj.work/'
    return new URL(href, base).pathname.split('/').filter(Boolean).pop() ?? ''
  } catch {
    return ''
  }
}

/** Updates the fallback link inside the pre-rendered download popover. */
export function prepareDownloadAdPopup(popover: HTMLElement, href: string, download?: string): void {
  const fallback = popover.querySelector(`#${DOWNLOAD_AD_FALLBACK_ID}`)
  if (!fallback || !('href' in fallback)) return

  const anchor = fallback as HTMLAnchorElement
  anchor.href = href
  const filename = resolveDownloadFilename(href, download)
  if (filename !== undefined) {
    anchor.download = filename
  } else {
    anchor.removeAttribute('download')
  }
}

/** Programmatically starts a download via a short-lived anchor in `document.body`. */
export function startDownload(href: string, download?: string, newTab = false): void {
  const anchor = document.createElement('a')
  anchor.href = href
  const filename = resolveDownloadFilename(href, download)
  if (filename !== undefined) {
    anchor.download = filename
  }
  if (newTab) {
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
  }
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

function defaultFindDownloadButton(target: EventTarget | null): HTMLButtonElement | null {
  if (!(target instanceof Element)) return null
  const button = target.closest(DOWNLOAD_LINK_SELECTOR)
  return button instanceof HTMLButtonElement ? button : null
}

/**
 * Wires download buttons to the pre-rendered AdSense popover.
 *
 * Popover open/close (including re-clicks while already open) is handled
 * declaratively by `popovertarget` / `popovertargetaction` on the buttons.
 * This script only updates the fallback link and starts the file download.
 */
export function setupDownloadAdPopup({
  whenReady,
  startDownload: startDownloadFn = startDownload,
  getPopupElement = () => document.querySelector<HTMLElement>(DOWNLOAD_AD_POPUP_SELECTOR),
  findDownloadButton = defaultFindDownloadButton,
  addClickListener = (handler) => document.addEventListener('click', handler, { capture: true }),
  hasDownloadUi = defaultHasDownloadUi,
  baseUrl,
  gtagFn,
  getPagePath = () => (typeof window !== 'undefined' ? window.location.pathname : ''),
}: DownloadAdPopupOptions): void {
  whenReady(() => {
    if (!hasDownloadUi()) return

    addClickListener((event) => {
      const button = findDownloadButton(event.target)
      if (!button) return

      const href = resolveDownloadHref(button, baseUrl)
      if (!href) return

      const download = button.hasAttribute(DOWNLOAD_ATTR_DATA_ATTR) ? '' : undefined
      const newTab = button.hasAttribute(DOWNLOAD_NEW_TAB_DATA_ATTR)
      const popover = getPopupElement()
      if (popover) {
        prepareDownloadAdPopup(popover, href, download)
      }
      if (gtagFn) {
        const linkText = button.textContent?.trim() ?? ''
        trackFileDownload(gtagFn, href, linkText, getPagePath())
      }
      startDownloadFn(href, download, newTab)
    })
  })
}

/** Pre-rendered download popover with an AdSense ad slot. */
export default function DownloadAdDialog() {
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: popover is labelled for E2E and assistive tech
    <div id={DOWNLOAD_AD_POPUP_ID} popover="auto" class={DOWNLOAD_DIALOG_CLASS} aria-label={DOWNLOAD_DIALOG_LABEL}>
      <button
        type="button"
        popovertarget={DOWNLOAD_AD_POPUP_ID}
        popovertargetaction="hide"
        class="download-ad-close-icon"
        aria-label="閉じる（×）"
      >
        ×
      </button>
      <p>
        ダウンロードを開始しました。
        {/* biome-ignore lint/a11y/useValidAnchor: href is updated by client script on download click */}
        <a id={DOWNLOAD_AD_FALLBACK_ID} href="#">
          {DOWNLOAD_FALLBACK_LINK_TEXT}
        </a>
      </p>
      <div class="download-ad-container">
        <ins
          class="adsbygoogle"
          style="display:block"
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={DOWNLOAD_AD_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        {html`<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`}
      </div>
      <div class="download-ad-actions">
        <button
          type="button"
          popovertarget={DOWNLOAD_AD_POPUP_ID}
          popovertargetaction="hide"
          class="download-ad-close"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}