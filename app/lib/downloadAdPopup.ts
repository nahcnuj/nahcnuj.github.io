import { DOWNLOAD_AD_FALLBACK_ID, DOWNLOAD_AD_POPUP_ID } from './downloadAdMarkup'
import { DOWNLOAD_AD_DATA_ATTR } from './rehypeDownloadLinks'

export interface DownloadAdPopupOptions {
  /** Calls `fn` once the DOM is ready to be queried. */
  whenReady: (fn: () => void) => void
  /** Returns download links marked by the rehype plugin. */
  getDownloadLinks: () => HTMLAnchorElement[]
  /** Returns the pre-rendered download popover element. */
  getPopupElement: () => HTMLElement | null
}

export const DOWNLOAD_DIALOG_LABEL = 'ダウンロード時の広告'
export const DOWNLOAD_DIALOG_CLASS = 'download-ad-dialog'
export const DOWNLOAD_FALLBACK_LINK_TEXT = '自動でダウンロードされない場合はこちらをクリックしてください'

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

/**
 * Wires download links to the pre-rendered AdSense popover.
 * Opening and closing are handled by the Popover API (`showPopover()` and
 * declarative `popovertargetaction` on close buttons). The native download
 * behaviour of the link is not blocked.
 */
export function setupDownloadAdPopup({
  whenReady,
  getDownloadLinks,
  getPopupElement,
}: DownloadAdPopupOptions): void {
  whenReady(() => {
    const popover = getPopupElement()
    if (!popover) return

    for (const link of getDownloadLinks()) {
      link.addEventListener('click', () => {
        const href = link.href
        if (!href) return

        const download = link.getAttribute('download') ?? undefined
        prepareDownloadAdPopup(popover, href, download)
        popover.showPopover()
      })
    }
  })
}

/** Selector for download links produced by `rehypeDownloadLinks`. */
export const DOWNLOAD_LINK_SELECTOR = `a[${DOWNLOAD_AD_DATA_ATTR}]`

/** Selector for the pre-rendered download popover. */
export const DOWNLOAD_AD_POPUP_SELECTOR = `[popover]#${DOWNLOAD_AD_POPUP_ID}`