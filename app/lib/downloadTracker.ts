import type { GtagFn } from './scrollDepthTracker'

export const FILE_DOWNLOAD_EVENT = 'file_download'

export interface FileDownloadEventParams {
  file_name: string
  file_extension: string
  link_url: string
  link_text: string
  link_id: string
}

/** Builds GA4 `file_download` event parameters from a resolved download URL. */
export function buildFileDownloadParams(
  href: string,
  linkText: string,
  pagePath: string,
): FileDownloadEventParams {
  let pathname: string
  try {
    pathname = new URL(href).pathname
  } catch {
    pathname = href
  }

  const file_name = pathname.split('/').filter(Boolean).pop() ?? ''
  const extMatch = file_name.match(/\.([^.]+)$/)

  return {
    file_name,
    file_extension: extMatch?.[1]?.toLowerCase() ?? '',
    link_url: href,
    link_text: linkText,
    link_id: pagePath,
  }
}

/** Sends a GA4 `file_download` event for a download-button click. */
export function trackFileDownload(
  gtagFn: GtagFn,
  href: string,
  linkText: string,
  pagePath: string,
): void {
  gtagFn('event', FILE_DOWNLOAD_EVENT, buildFileDownloadParams(href, linkText, pagePath))
}