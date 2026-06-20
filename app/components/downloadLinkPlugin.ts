import type { Element, ElementContent, Root as HastRoot } from 'hast'
import type { Root as MdastRoot } from 'mdast'
import { toString as hastToString } from 'hast-util-to-string'
import { toString as mdastToString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'
import { SITE_URL } from '../lib/site'

export const DOWNLOAD_AD_POPUP_ID = 'download-ad-popup'
export const DOWNLOAD_AD_BUTTON_CLASS = 'download-ad-button'
export const DOWNLOAD_AD_POPUP_FRONTMATTER_KEY = 'downloadAdPopup'

export const DOWNLOAD_AD_DATA_ATTR = 'data-download-ad'
export const DOWNLOAD_HREF_DATA_ATTR = 'data-download-href'
export const DOWNLOAD_NEW_TAB_DATA_ATTR = 'data-download-new-tab'
/** Empty `data-download` marks same-origin downloads for programmatic `<a download>`. */
export const DOWNLOAD_ATTR_DATA_ATTR = 'data-download'

const DOWNLOAD_LINK_MARKER = 'ダウンロード'

/** Returns true when link text contains 「ダウンロード」. */
function hasDownloadLinkMarker(text: string): boolean {
  return text.includes(DOWNLOAD_LINK_MARKER)
}

/** Returns true when the href looks like a direct file download (has a file extension). */
function hasDownloadableExtension(href: string): boolean {
  const path = href.split(/[?#]/)[0] ?? ''
  return /\.[a-zA-Z0-9]{1,8}$/.test(path)
}

/** Returns true for a 「ダウンロード」 link whose href points at a downloadable file. */
export function isDownloadLink(href: string, text: string): boolean {
  return href.length > 0 && hasDownloadLinkMarker(text) && hasDownloadableExtension(href)
}

/** Returns true when the browser can honour the `download` attribute for this href. */
function isSameOriginDownloadHref(href: string): boolean {
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
 * Marks frontmatter with `downloadAdPopup: true` on MDX pages that contain a
 * 「ダウンロード」 link so the layout can render the AdSense popup component.
 */
export function remarkDownloadAdPopup() {
  return (tree: MdastRoot) => {
    let hasDownloadLink = false

    visit(tree, 'link', (node) => {
      if (isDownloadLink(node.url, mdastToString(node))) {
        hasDownloadLink = true
      }
    })

    if (!hasDownloadLink) return

    const yamlNode = tree.children.find((node) => node.type === 'yaml')
    if (yamlNode?.type !== 'yaml') {
      throw new Error('MDX pages with download links must include YAML frontmatter')
    }

    const yaml = String(yamlNode.value).trimEnd()
    const key = DOWNLOAD_AD_POPUP_FRONTMATTER_KEY
    if (new RegExp(`^${key}:\\s*true\\s*$`, 'm').test(yaml)) return

    if (new RegExp(`^${key}:`, 'm').test(yaml)) {
      yamlNode.value = `${yaml.replace(new RegExp(`^${key}:.*$`, 'm'), `${key}: true`)}\n`
      return
    }

    yamlNode.value = `${yaml}\n${key}: true\n`
  }
}

/**
 * Replaces 「ダウンロード」 anchor links with `<button popovertarget>` elements that
 * open the AdSense popover declaratively and trigger downloads via client script.
 */
export function rehypeDownloadLinks() {
  return (tree: HastRoot) => {
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

      node.children = stripExternalLinkIndicator(node.children)

      if (sameOrigin) {
        node.properties[DOWNLOAD_ATTR_DATA_ATTR] = ''
      } else {
        node.properties[DOWNLOAD_NEW_TAB_DATA_ATTR] = ''
      }
    })
  }
}