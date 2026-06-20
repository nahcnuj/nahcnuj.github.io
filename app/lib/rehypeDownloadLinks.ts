import type { Element, ElementContent, Root } from 'hast'
import { toString as hastToString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
import { SITE_URL } from './site'

export const DOWNLOAD_LINK_MARKER = 'ダウンロード'
export const DOWNLOAD_AD_DATA_ATTR = 'data-download-ad'

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
  return hastToString(element).includes(DOWNLOAD_LINK_MARKER)
}

/** Removes the external-link indicator span injected by rehype-external-links. */
export function stripExternalLinkIndicator(children: ElementContent[]): ElementContent[] {
  return children.filter((child) => {
    if (child.type !== 'element' || child.tagName !== 'span') return true
    return child.properties?.['aria-label'] !== 'open in new window'
  })
}

/**
 * Adds `download` and `data-download-ad` to Markdown links whose text contains
 * 「ダウンロード」, and strips new-tab behaviour added by rehype-external-links.
 */
export function rehypeDownloadLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (!isDownloadLinkText(node)) return

      const href = String(node.properties?.href ?? '')
      node.properties = node.properties ?? {}
      node.properties[DOWNLOAD_AD_DATA_ATTR] = ''

      if (isSameOriginDownloadHref(href)) {
        node.properties.download = ''
        delete node.properties.target
        node.children = stripExternalLinkIndicator(node.children)
      }
    })
  }
}