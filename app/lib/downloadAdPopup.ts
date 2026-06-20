import { DOWNLOAD_AD_FALLBACK_ID, DOWNLOAD_AD_POPUP_ID } from './downloadAdMarkup'
import { DOWNLOAD_AD_DATA_ATTR } from './rehypeDownloadLinks'

export interface DownloadAdPopupOptions {
  /** Calls `fn` once the DOM is ready to be queried. */
  whenReady: (fn: () => void) => void
  /** Returns download links marked by the rehype plugin. */
  getDownloadLinks: () => HTMLAnchorElement[]
  /** Returns the pre-rendered download popup dialog. */
  getPopupDialog: () => HTMLDialogElement | null
  /** Opens the dialog modally. */
  showPopup?: (dialog: HTMLDialogElement) => void
}

export const DOWNLOAD_DIALOG_LABEL = 'ダウンロード時の広告'
export const DOWNLOAD_DIALOG_CLASS = 'download-ad-dialog'
export const DOWNLOAD_FALLBACK_LINK_TEXT = '自動でダウンロードされない場合はこちらをクリックしてください'

/** Updates the fallback link inside the pre-rendered download popup dialog. */
export function prepareDownloadAdPopup(
  dialog: HTMLDialogElement,
  href: string,
  download?: string,
): void {
  const fallback = dialog.querySelector(`#${DOWNLOAD_AD_FALLBACK_ID}`)
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
 * Shows the pre-rendered AdSense popup when Markdown download links are clicked.
 * The native download behaviour of the link is not blocked.
 */
export function setupDownloadAdPopup({
  whenReady,
  getDownloadLinks,
  getPopupDialog,
  showPopup = (dialog) => {
    if (!dialog.open) dialog.showModal()
  },
}: DownloadAdPopupOptions): void {
  whenReady(() => {
    const dialog = getPopupDialog()
    if (!dialog) return

    for (const link of getDownloadLinks()) {
      link.addEventListener('click', () => {
        const href = link.href
        if (!href) return

        const download = link.getAttribute('download') ?? undefined
        prepareDownloadAdPopup(dialog, href, download)
        showPopup(dialog)
      })
    }
  })
}

/** Selector for download links produced by `rehypeDownloadLinks`. */
export const DOWNLOAD_LINK_SELECTOR = `a[${DOWNLOAD_AD_DATA_ATTR}]`

/** Selector for the pre-rendered download popup dialog. */
export const DOWNLOAD_AD_POPUP_SELECTOR = `dialog#${DOWNLOAD_AD_POPUP_ID}`