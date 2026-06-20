import type { Element, Root } from 'hast'
import { describe, expect, it } from 'vitest'
import { DOWNLOAD_AD_POPUP_ID } from './downloadAdMarkup'
import {
  DOWNLOAD_AD_DATA_ATTR,
  DOWNLOAD_ATTR_DATA_ATTR,
  DOWNLOAD_HREF_DATA_ATTR,
  DOWNLOAD_NEW_TAB_DATA_ATTR,
  isDownloadLinkText,
  rehypeDownloadLinks,
  stripExternalLinkIndicator,
} from './rehypeDownloadLinks'

function makeLink(href: string, text: string, extraChildren: Element['children'] = []): Element {
  return {
    type: 'element',
    tagName: 'a',
    properties: { href, target: '_blank', rel: ['nofollow', 'noopener', 'noreferrer'] },
    children: [{ type: 'text', value: text }, ...extraChildren],
  }
}

function applyPlugin(tree: Root): Root {
  rehypeDownloadLinks()(tree)
  return tree
}

describe('isDownloadLinkText', () => {
  it('returns true when link text contains ダウンロード', () => {
    expect(isDownloadLinkText(makeLink('/files/sample.pdf', 'PDFをダウンロード'))).toBe(true)
  })

  it('returns true for [ダウンロード](./test.pdf) style links', () => {
    expect(isDownloadLinkText(makeLink('./test.pdf', 'ダウンロード'))).toBe(true)
  })

  it('returns false when link text does not contain ダウンロード', () => {
    expect(isDownloadLinkText(makeLink('/files/sample.pdf', 'PDFを開く'))).toBe(false)
  })

  it('returns false when link text contains ダウンロード but href has no file extension', () => {
    expect(isDownloadLinkText(makeLink('/download-page', 'ダウンロードページへ'))).toBe(false)
  })

  it('returns false when href is missing', () => {
    const node: Element = {
      type: 'element',
      tagName: 'a',
      properties: {},
      children: [{ type: 'text', value: 'ダウンロード' }],
    }
    expect(isDownloadLinkText(node)).toBe(false)
  })
})

describe('stripExternalLinkIndicator', () => {
  it('removes the new-window indicator span', () => {
    const children = makeLink('https://example.com/file.zip', 'ダウンロード', [
      {
        type: 'element',
        tagName: 'span',
        properties: { 'aria-label': 'open in new window' },
        children: [{ type: 'text', value: ' ⧉' }],
      },
    ]).children

    const result = stripExternalLinkIndicator(children)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ type: 'text', value: 'ダウンロード' })
  })
})

describe('rehypeDownloadLinks', () => {
  it('replaces same-origin download anchors with popover buttons', () => {
    const tree: Root = {
      type: 'root',
      children: [makeLink('./test.pdf', 'ダウンロード')],
    }

    applyPlugin(tree)
    const button = tree.children[0] as Element
    expect(button.tagName).toBe('button')
    expect(button.properties.type).toBe('button')
    expect(button.properties.popovertarget).toBe(DOWNLOAD_AD_POPUP_ID)
    expect(button.properties.popovertargetaction).toBe('show')
    expect(button.properties[DOWNLOAD_AD_DATA_ATTR]).toBe('')
    expect(button.properties[DOWNLOAD_HREF_DATA_ATTR]).toBe('./test.pdf')
    expect(button.properties[DOWNLOAD_ATTR_DATA_ATTR]).toBe('')
    expect(button.properties.href).toBeUndefined()
  })

  it('opens cross-origin download links in a new tab via data attribute', () => {
    const tree: Root = {
      type: 'root',
      children: [makeLink('https://example.com/file.zip', 'ダウンロードする')],
    }

    applyPlugin(tree)
    const button = tree.children[0] as Element
    expect(button.tagName).toBe('button')
    expect(button.properties[DOWNLOAD_HREF_DATA_ATTR]).toBe('https://example.com/file.zip')
    expect(button.properties[DOWNLOAD_NEW_TAB_DATA_ATTR]).toBe('')
    expect(button.properties[DOWNLOAD_ATTR_DATA_ATTR]).toBeUndefined()
    expect(button.properties.target).toBeUndefined()
  })

  it('does not modify links without ダウンロード in the text', () => {
    const link = makeLink('https://example.com/file.zip', 'ファイルを開く')
    const tree: Root = { type: 'root', children: [link] }

    applyPlugin(tree)
    expect((tree.children[0] as Element).tagName).toBe('a')
    expect((tree.children[0] as Element).properties.target).toBe('_blank')
  })
})