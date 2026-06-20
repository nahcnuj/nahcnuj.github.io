import type { Root } from 'mdast'
import { toString as mdastToString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'
import { isDownloadLink } from './rehypeDownloadLinks'

export const DOWNLOAD_AD_POPUP_FRONTMATTER_KEY = 'downloadAdPopup'

/**
 * Marks frontmatter with `downloadAdPopup: true` on MDX pages that contain a
 * 「ダウンロード」 link so the layout can render the literal AdSense popup HTML.
 */
export function remarkDownloadAdPopup() {
  return (tree: Root) => {
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