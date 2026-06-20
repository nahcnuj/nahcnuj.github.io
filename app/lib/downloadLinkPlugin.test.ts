import type { Element, Root as HastRoot } from 'hast'
import type { Root as MdastRoot } from 'mdast'
import { describe, expect, it } from 'vitest'
import {
  DOWNLOAD_AD_DATA_ATTR,
  DOWNLOAD_AD_POPUP_FRONTMATTER_KEY,
  DOWNLOAD_AD_POPUP_ID,
  DOWNLOAD_ATTR_DATA_ATTR,
  DOWNLOAD_HREF_DATA_ATTR,
  DOWNLOAD_NEW_TAB_DATA_ATTR,
  hasDownloadableExtension,
  isDownloadLinkText,
  rehypeDownloadLinks,
  remarkDownloadAdPopup,
  stripExternalLinkIndicator,
} from './downloadLinkPlugin'

function applyRemark(tree: MdastRoot): MdastRoot {
  remarkDownloadAdPopup()(tree)
  return tree
}

describe('remarkDownloadAdPopup', () => {
  it('adds downloadAdPopup: true to frontmatter when a download link is present', () => {
    const tree: MdastRoot = {
      type: 'root',
      children: [
        {
          type: 'yaml',
          value: 'title: Download test\npublished: 2026-06-20\n',
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://example.com/file.zip',
              children: [{ type: 'text', value: 'ファイルをダウンロード' }],
            },
          ],
        },
      ],
    }

    applyRemark(tree)

    expect(tree.children[0]).toMatchObject({ type: 'yaml' })
    expect((tree.children[0] as { value: string }).value).toContain(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}: true`)
  })

  it('throws when a download link is present but YAML frontmatter is missing', () => {
    const tree: MdastRoot = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://example.com/file.zip',
              children: [{ type: 'text', value: 'ファイルをダウンロード' }],
            },
          ],
        },
      ],
    }

    expect(() => applyRemark(tree)).toThrow('MDX pages with download links must include YAML frontmatter')
  })

  it('does not modify frontmatter when link text contains ダウンロード but href has no file extension', () => {
    const tree: MdastRoot = {
      type: 'root',
      children: [
        {
          type: 'yaml',
          value: 'title: Regular article\npublished: 2026-06-20\n',
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: '/download-page',
              children: [{ type: 'text', value: 'ダウンロードページへ' }],
            },
          ],
        },
      ],
    }

    applyRemark(tree)
    expect((tree.children[0] as { value: string }).value).not.toContain(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}:`)
  })

  it('does not modify frontmatter when no download link is present', () => {
    const tree: MdastRoot = {
      type: 'root',
      children: [
        {
          type: 'yaml',
          value: 'title: Regular article\npublished: 2026-06-20\n',
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://example.com/file.zip',
              children: [{ type: 'text', value: 'ファイルを開く' }],
            },
          ],
        },
      ],
    }

    applyRemark(tree)
    expect((tree.children[0] as { value: string }).value).not.toContain(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}:`)
  })

  it('overwrites downloadAdPopup: false when a download link is present', () => {
    const tree: MdastRoot = {
      type: 'root',
      children: [
        {
          type: 'yaml',
          value: 'title: Download test\npublished: 2026-06-20\ndownloadAdPopup: false\n',
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: './test.pdf',
              children: [{ type: 'text', value: 'ダウンロード' }],
            },
          ],
        },
      ],
    }

    applyRemark(tree)
    expect((tree.children[0] as { value: string }).value).toContain(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}: true`)
    expect((tree.children[0] as { value: string }).value).not.toContain(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}: false`)
  })
})

function makeLink(href: string, text: string, extraChildren: Element['children'] = []): Element {
  return {
    type: 'element',
    tagName: 'a',
    properties: { href, target: '_blank', rel: ['nofollow', 'noopener', 'noreferrer'] },
    children: [{ type: 'text', value: text }, ...extraChildren],
  }
}

function applyRehype(tree: HastRoot): HastRoot {
  rehypeDownloadLinks()(tree)
  return tree
}

describe('hasDownloadableExtension', () => {
  it('returns false for HTML page paths', () => {
    expect(hasDownloadableExtension('./guide.html')).toBe(false)
    expect(hasDownloadableExtension('/download.htm')).toBe(false)
  })

  it('returns true for common binary file extensions', () => {
    expect(hasDownloadableExtension('./test.pdf')).toBe(true)
    expect(hasDownloadableExtension('/files/archive.zip')).toBe(true)
  })
})

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

  it('returns false when link text contains ダウンロード but href points at an HTML page', () => {
    expect(isDownloadLinkText(makeLink('./guide.html', 'ガイドをダウンロード'))).toBe(false)
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
    const tree: HastRoot = {
      type: 'root',
      children: [makeLink('./test.pdf', 'ダウンロード')],
    }

    applyRehype(tree)
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
    const tree: HastRoot = {
      type: 'root',
      children: [makeLink('https://example.com/file.zip', 'ダウンロードする')],
    }

    applyRehype(tree)
    const button = tree.children[0] as Element
    expect(button.tagName).toBe('button')
    expect(button.properties[DOWNLOAD_HREF_DATA_ATTR]).toBe('https://example.com/file.zip')
    expect(button.properties[DOWNLOAD_NEW_TAB_DATA_ATTR]).toBe('')
    expect(button.properties[DOWNLOAD_ATTR_DATA_ATTR]).toBeUndefined()
    expect(button.properties.target).toBeUndefined()
  })

  it('strips the external-link indicator from cross-origin download buttons', () => {
    const tree: HastRoot = {
      type: 'root',
      children: [
        makeLink('https://example.com/file.zip', 'ダウンロード', [
          {
            type: 'element',
            tagName: 'span',
            properties: { 'aria-label': 'open in new window' },
            children: [{ type: 'text', value: ' ⧉' }],
          },
        ]),
      ],
    }

    applyRehype(tree)
    const button = tree.children[0] as Element
    expect(button.children).toHaveLength(1)
    expect(button.children[0]).toMatchObject({ type: 'text', value: 'ダウンロード' })
  })

  it('does not modify links without ダウンロード in the text', () => {
    const link = makeLink('https://example.com/file.zip', 'ファイルを開く')
    const tree: HastRoot = { type: 'root', children: [link] }

    applyRehype(tree)
    expect((tree.children[0] as Element).tagName).toBe('a')
    expect((tree.children[0] as Element).properties.target).toBe('_blank')
  })
})