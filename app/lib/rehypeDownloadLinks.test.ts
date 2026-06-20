import type { Element, Root } from 'hast'
import { describe, expect, it } from 'vitest'
import {
  DOWNLOAD_AD_DATA_ATTR,
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
  it('adds download and data-download-ad attributes for same-origin links', () => {
    const tree: Root = {
      type: 'root',
      children: [makeLink('./test.pdf', 'ファイルをダウンロード')],
    }

    applyPlugin(tree)
    const link = tree.children[0] as Element
    expect(link.properties.download).toBe('')
    expect(link.properties[DOWNLOAD_AD_DATA_ATTR]).toBe('')
  })

  it('removes target for same-origin download links', () => {
    const tree: Root = {
      type: 'root',
      children: [makeLink('/files/sample.pdf', 'ダウンロードする')],
    }

    applyPlugin(tree)
    const link = tree.children[0] as Element
    expect(link.properties.target).toBeUndefined()
    expect(link.properties.download).toBe('')
  })

  it('keeps target for cross-origin download links', () => {
    const tree: Root = {
      type: 'root',
      children: [makeLink('https://example.com/file.zip', 'ダウンロードする')],
    }

    applyPlugin(tree)
    const link = tree.children[0] as Element
    expect(link.properties.target).toBe('_blank')
    expect(link.properties.download).toBeUndefined()
    expect(link.properties[DOWNLOAD_AD_DATA_ATTR]).toBe('')
  })

  it('does not modify links without ダウンロード in the text', () => {
    const link = makeLink('https://example.com/file.zip', 'ファイルを開く')
    const tree: Root = { type: 'root', children: [link] }

    applyPlugin(tree)
    expect((tree.children[0] as Element).properties.download).toBeUndefined()
    expect((tree.children[0] as Element).properties.target).toBe('_blank')
  })

})