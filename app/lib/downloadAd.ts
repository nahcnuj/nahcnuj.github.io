import type { Element, ElementContent, Root as HastRoot } from 'hast'
import type { Root as MdastRoot } from 'mdast'
import { toString as hastToString } from 'hast-util-to-string'
import { toString as mdastToString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'
import { SITE_URL } from './site'

// --- constants ---

export const DOWNLOAD_AD_POPUP_ID = 'download-ad-popup'
export const DOWNLOAD_AD_FALLBACK_ID = 'download-ad-fallback'

export const DOWNLOAD_DIALOG_LABEL = 'ダウンロード時の広告'
export const DOWNLOAD_DIALOG_CLASS = 'download-ad-dialog'
export const DOWNLOAD_AD_BUTTON_CLASS = 'download-ad-button'
export const DOWNLOAD_FALLBACK_LINK_TEXT = '自動でダウンロードされない場合はこちらをクリックしてください'

export const DOWNLOAD_AD_POPUP_FRONTMATTER_KEY = 'downloadAdPopup'

export const DOWNLOAD_LINK_MARKER = 'ダウンロード'
export const DOWNLOAD_AD_DATA_ATTR = 'data-download-ad'
export const DOWNLOAD_HREF_DATA_ATTR = 'data-download-href'
export const DOWNLOAD_NEW_TAB_DATA_ATTR = 'data-download-new-tab'
/** Empty `data-download` marks same-origin downloads for programmatic `<a download>`. */
export const DOWNLOAD_ATTR_DATA_ATTR = 'data-download'

export const DOWNLOAD_LINK_SELECTOR = `button[${DOWNLOAD_AD_DATA_ATTR}]`
export const DOWNLOAD_AD_POPUP_SELECTOR = `[popover]#${DOWNLOAD_AD_POPUP_ID}`

// --- link detection (shared by remark + rehype) ---

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

// --- remark plugin ---

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
    if (yaml.includes(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}:`)) return

    yamlNode.value = `${yaml}\n${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}: true\n`
  }
}

// --- rehype plugin ---

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

      if (sameOrigin) {
        node.properties[DOWNLOAD_ATTR_DATA_ATTR] = ''
        node.children = stripExternalLinkIndicator(node.children)
      } else {
        node.properties[DOWNLOAD_NEW_TAB_DATA_ATTR] = ''
      }
    })
  }
}

// --- client wiring ---

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