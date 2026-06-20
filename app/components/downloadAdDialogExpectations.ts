import { expect } from 'vitest'
import { DOWNLOAD_AD_POPUP_ID } from '../lib/downloadLinkPlugin'
import { ADSENSE_CLIENT_ID, DOWNLOAD_AD_SLOT } from '../lib/site'
import {
  DOWNLOAD_AD_FALLBACK_ID,
  DOWNLOAD_DIALOG_CLASS,
  DOWNLOAD_DIALOG_LABEL,
  DOWNLOAD_FALLBACK_LINK_TEXT,
} from './DownloadAdDialog'

function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`))
  return match?.[1]
}

function assertDefined<T>(value: T | undefined, message: string): asserts value is T {
  expect(value, message).toBeDefined()
  if (value === undefined) {
    throw new Error(message)
  }
}

function firstTag(html: string, selector: string): string | undefined {
  if (selector.startsWith('#')) {
    const id = selector.slice(1)
    const match = html.match(new RegExp(`<[^>]+id="${id}"[^>]*>`, 'i'))
    return match?.[0]
  }
  if (selector.startsWith('.')) {
    const className = selector.slice(1)
    const match = html.match(new RegExp(`<[^>]+class="${className}"[^>]*>`, 'i'))
    return match?.[0]
  }
  const tagName = selector
  const match = html.match(new RegExp(`<${tagName}[^>]*>`, 'i'))
  return match?.[0]
}

/** Asserts that rendered HTML includes required download-popup elements and attributes. */
export function expectDownloadAdDialogHtml(html: string): void {
  const popover = firstTag(html, `#${DOWNLOAD_AD_POPUP_ID}`)
  assertDefined(popover, 'download popover element')
  expect(attr(popover, 'popover')).toBe('auto')
  expect(attr(popover, 'class')).toBe(DOWNLOAD_DIALOG_CLASS)
  expect(attr(popover, 'aria-label')).toBe(DOWNLOAD_DIALOG_LABEL)

  const closeIcon = html.match(/<button[^>]*class="download-ad-close-icon"[^>]*>/i)?.[0]
  assertDefined(closeIcon, 'close icon button')
  expect(attr(closeIcon, 'type')).toBe('button')
  expect(attr(closeIcon, 'popovertarget')).toBe(DOWNLOAD_AD_POPUP_ID)
  expect(attr(closeIcon, 'popovertargetaction')).toBe('hide')
  expect(attr(closeIcon, 'aria-label')).toBe('閉じる（×）')

  const fallback = firstTag(html, `#${DOWNLOAD_AD_FALLBACK_ID}`)
  assertDefined(fallback, 'fallback download link')
  expect(attr(fallback, 'href')).toBe('#')
  expect(html).toContain(DOWNLOAD_FALLBACK_LINK_TEXT)
  expect(html).toContain('ダウンロードを開始しました。')

  const ins = firstTag(html, 'ins')
  assertDefined(ins, 'AdSense ins element')
  expect(attr(ins, 'class')).toBe('adsbygoogle')
  expect(attr(ins, 'style')).toBe('display:block')
  expect(attr(ins, 'data-ad-client')).toBe(ADSENSE_CLIENT_ID)
  expect(attr(ins, 'data-ad-slot')).toBe(DOWNLOAD_AD_SLOT)
  expect(attr(ins, 'data-ad-format')).toBe('auto')
  expect(attr(ins, 'data-full-width-responsive')).toBe('true')

  expect(html).toContain('(adsbygoogle = window.adsbygoogle || []).push({})')

  const closeButton = html.match(/<button[^>]*class="download-ad-close"[^>]*>/i)?.[0]
  assertDefined(closeButton, 'close button')
  expect(attr(closeButton, 'type')).toBe('button')
  expect(attr(closeButton, 'popovertarget')).toBe(DOWNLOAD_AD_POPUP_ID)
  expect(attr(closeButton, 'popovertargetaction')).toBe('hide')
}