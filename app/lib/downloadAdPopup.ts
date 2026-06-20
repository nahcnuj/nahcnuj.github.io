import { DOWNLOAD_AD_FALLBACK_ID, DOWNLOAD_AD_POPUP_ID } from './downloadAdMarkup'
import {
  DOWNLOAD_AD_DATA_ATTR,
  DOWNLOAD_ATTR_DATA_ATTR,
  DOWNLOAD_HREF_DATA_ATTR,
  DOWNLOAD_NEW_TAB_DATA_ATTR,
} from './rehypeDownloadLinks'

export {
  DOWNLOAD_DIALOG_CLASS,
  DOWNLOAD_DIALOG_LABEL,
  DOWNLOAD_FALLBACK_LINK_TEXT,
} from './downloadAdMarkup'

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

/** Updates the fallback link inside the pre-rendered download popover. */
export function prepareDownloadAdPopup(popover: HTMLElement, href: string, download?: string): void {
  const fallback = popover.querySelector(`#${DOWNLOAD_AD_FALLBACK_ID}`)
  if (!fallback || !('href' in fallback)) return

  const anchor = fallback as HTMLAnchorElement
  anchor.href = href
  if (download !== undefined) {
    anchor.download = download
  } else {
    anchor.removeAttribute('download')
  }
}

/** Programmatically starts a download from a transient anchor element. */
export function startDownload(href: string, download?: string, newTab = false): void {
  const anchor = document.createElement('a')
  anchor.href = href
  if (download !== undefined) anchor.download = download
  if (newTab) {
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
  }
  anchor.click()
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
  addClickListener = (handler) => document.addEventListener('click', handler),
}: DownloadAdPopupOptions): void {
  whenReady(() => {
    const popover = getPopupElement()
    if (!popover) return

    addClickListener((event) => {
      const button = findDownloadButton(event.target)
      if (!button) return

      const href = resolveDownloadHref(button)
      if (!href) return

      const download = button.hasAttribute(DOWNLOAD_ATTR_DATA_ATTR) ? '' : undefined
      const newTab = button.hasAttribute(DOWNLOAD_NEW_TAB_DATA_ATTR)
      prepareDownloadAdPopup(popover, href, download)
      startDownloadFn(href, download, newTab)
    })
  })
}

/** Selector for download buttons produced by `rehypeDownloadLinks`. */
export const DOWNLOAD_LINK_SELECTOR = `button[${DOWNLOAD_AD_DATA_ATTR}]`

/** Selector for the pre-rendered download popover. */
export const DOWNLOAD_AD_POPUP_SELECTOR = `[popover]#${DOWNLOAD_AD_POPUP_ID}`