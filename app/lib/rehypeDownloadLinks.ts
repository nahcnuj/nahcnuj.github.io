import type { Element, ElementContent, Root } from 'hast'
import { toString as hastToString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
export const DOWNLOAD_LINK_MARKER = 'ダウンロード'
export const DOWNLOAD_AD_DATA_ATTR = 'data-download-ad'

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

      node.properties = node.properties ?? {}
      node.properties.download = ''
      node.properties[DOWNLOAD_AD_DATA_ATTR] = ''
      delete node.properties.target
      node.children = stripExternalLinkIndicator(node.children)
    })
  }
}