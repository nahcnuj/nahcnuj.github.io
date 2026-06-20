import type { Root } from 'mdast'
import { describe, expect, it } from 'vitest'
import { DOWNLOAD_AD_POPUP_FRONTMATTER_KEY, remarkDownloadAdPopup } from './remarkDownloadAdPopup'

function applyPlugin(tree: Root): Root {
  remarkDownloadAdPopup()(tree)
  return tree
}

describe('remarkDownloadAdPopup', () => {
  it('adds downloadAdPopup: true to frontmatter when a download link is present', () => {
    const tree: Root = {
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

    applyPlugin(tree)

    expect(tree.children[0]).toMatchObject({ type: 'yaml' })
    expect((tree.children[0] as { value: string }).value).toContain(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}: true`)
  })

  it('does not modify frontmatter when no download link is present', () => {
    const tree: Root = {
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

    applyPlugin(tree)
    expect((tree.children[0] as { value: string }).value).not.toContain(`${DOWNLOAD_AD_POPUP_FRONTMATTER_KEY}:`)
  })
})