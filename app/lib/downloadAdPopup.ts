import {
  DOWNLOAD_AD_FALLBACK_ID,
  DOWNLOAD_AD_POPUP_ID,
  DOWNLOAD_AD_TRIGGER_ID,
} from './downloadAdMarkup'
import { DOWNLOAD_AD_DATA_ATTR } from './rehypeDownloadLinks'

export interface DownloadAdPopupOptions {
  /** Calls `fn` once the DOM is ready to be queried. */
  whenReady: (fn: () => void) => void
  /** Returns download links marked by the rehype plugin. */
  getDownloadLinks: () => HTMLAnchorElement[]
  /** Returns the pre-rendered download popover element. */
  getPopupElement: () => HTMLElement | null
  /** Returns the hidden button that opens the popover declaratively. */
  getShowTrigger: () => HTMLButtonElement | null
  /** Opens the popover via the declarative show trigger. */
  showPopup?: (popover: HTMLElement, trigger: HTMLButtonElement | null) => void
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
 * Shows the pre-rendered AdSense popover when Markdown download links are clicked.
 * The native download behaviour of the link is not blocked.
 */
export function setupDownloadAdPopup({
  whenReady,
  getDownloadLinks,
  getPopupElement,
  getShowTrigger,
  showPopup = (_popover, trigger) => {
    trigger?.click()
  },
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
        showPopup(popover, getShowTrigger())
      })
    }
  })
}

/** Selector for download links produced by `rehypeDownloadLinks`. */
export const DOWNLOAD_LINK_SELECTOR = `a[${DOWNLOAD_AD_DATA_ATTR}]`

/** Selector for the pre-rendered download popover. */
export const DOWNLOAD_AD_POPUP_SELECTOR = `[popover]#${DOWNLOAD_AD_POPUP_ID}`

/** Selector for the hidden declarative show trigger button. */
export const DOWNLOAD_AD_TRIGGER_SELECTOR = `button#${DOWNLOAD_AD_TRIGGER_ID}`