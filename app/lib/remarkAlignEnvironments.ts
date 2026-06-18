import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Fix alignment markers for KaTeX compatibility
 *
 * This plugin MUST run AFTER remarkMath in the plugin chain to process math nodes.
 * It removes & alignment markers that cause KaTeX parse errors.
 *
 * See: https://github.com/remarkjs/remark-math/issues/11
 */
export const remarkAlignEnvironments: Plugin<[], Root> = () => {
  return (tree) => {
    // Visit all math nodes and remove & characters
    visit(tree, 'math', (node: any) => {
      if (typeof node.value === 'string' && node.value.includes('&')) {
        // Remove all & characters from math content
        node.value = node.value.replace(/&/g, '')
        console.log(`[remarkAlignEnvironments] removed & from math node`)
      }
    })

    // Also handle escaped ampersands in HTML/text that might contain math
    visit(tree, (node: any) => {
      if (node.type === 'html' && typeof node.value === 'string' && node.value.includes('&amp;')) {
        if (node.value.includes('\\int') || node.value.includes('\\begin')) {
          node.value = node.value.replace(/&amp;/g, '')
          console.log(`[remarkAlignEnvironments] removed &amp; from HTML node`)
        }
      }
    })
  }
}
