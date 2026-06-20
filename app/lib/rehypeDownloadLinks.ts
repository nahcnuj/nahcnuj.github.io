import type { Element, ElementContent, Root } from 'hast'
import { toString as hastToString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
import { DOWNLOAD_AD_BUTTON_CLASS, DOWNLOAD_AD_POPUP_ID } from './downloadAdMarkup'
import { SITE_URL } from './site'

export const DOWNLOAD_LINK_MARKER = 'ダウンロード'
export const DOWNLOAD_AD_DATA_ATTR = 'data-download-ad'
export const DOWNLOAD_HREF_DATA_ATTR = 'data-download-href'
export const DOWNLOAD_NEW_TAB_DATA_ATTR = 'data-download-new-tab'
/** Empty `data-download` marks same-origin downloads for programmatic `<a download>`. */
export const DOWNLOAD_ATTR_DATA_ATTR = 'data-download'

/** Returns true when link text contains 「ダウンロード」. */
export function hasDownloadLinkMarker(text: string): boolean {
  return text.includes(DOWNLOAD_LINK_MARKER)
}

/** Returns true when the href looks like a direct file download (has a file extension). */
export function hasDownloadableExtension(href: string): boolean {
  const path = href.split(/[?#]/)[0] ?? ''
  return /\.[a-zA-Z0-9]{1,8}$/.test(path)
}

/** Returns true for a 「ダウンロード」 link whose href points at a downloadable file. */
export function isDownloadLink(href: string, text: string): boolean {
  return href.length > 0 && hasDownloadLinkMarker(text) && hasDownloadableExtension(href)
}

/** Returns true when the browser can honour the `download` attribute for this href. */
export function isSameOriginDownloadHref(href: string): boolean {
  if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) return true
  try {
    return new URL(href).origin === new URL(SITE_URL).origin
  } catch {
    return false
  }
}

/** Returns true when the element is an anchor whose text contains 「ダウンロード」. */
export function isDownloadLinkText(element: Element): boolean {
  if (element.tagName !== 'a') return false
  const href = element.properties?.href
  if (typeof href !== 'string' || href.length === 0) return false
  return isDownloadLink(href, hastToString(element))
}

/** Removes the external-link indicator span injected by rehype-external-links. */
export function stripExternalLinkIndicator(children: ElementContent[]): ElementContent[] {
  return children.filter((child) => {
    if (child.type !== 'element' || child.tagName !== 'span') return true
    return child.properties?.['aria-label'] !== 'open in new window'
  })
}

/**
 * Replaces 「ダウンロード」 anchor links with `<button popovertarget>` elements that
 * open the AdSense popover declaratively and trigger downloads via client script.
 */
export function rehypeDownloadLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (!isDownloadLinkText(node)) return

      const href = String(node.properties?.href ?? '')
      const sameOrigin = isSameOriginDownloadHref(href)

      node.tagName = 'button'
      node.properties = {
        type: 'button',
        class: DOWNLOAD_AD_BUTTON_CLASS,
        popovertarget: DOWNLOAD_AD_POPUP_ID,
        popovertargetaction: 'show',
        [DOWNLOAD_AD_DATA_ATTR]: '',
        [DOWNLOAD_HREF_DATA_ATTR]: href,
      }

      if (sameOrigin) {
        node.properties[DOWNLOAD_ATTR_DATA_ATTR] = ''
        node.children = stripExternalLinkIndicator(node.children)
      } else {
        node.properties[DOWNLOAD_NEW_TAB_DATA_ATTR] = ''
      }
    })
  }
}