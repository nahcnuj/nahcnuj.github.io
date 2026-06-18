import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Convert multi-line environments for KaTeX compatibility
 *
 * This plugin MUST run AFTER remarkMath in the plugin chain to process math nodes.
 * It removes & alignment markers that cause KaTeX parse errors.
 *
 * See: https://github.com/remarkjs/remark-math/issues/11
 */
export const remarkAlignEnvironments: Plugin<[], Root> = () => {
  return (tree) => {
    // HACK: Recursively visit ALL nodes and fix & in their string values
    // This ensures & is removed even if it appears in non-math contexts
    visit(tree, (node: any) => {
      if (node.type === 'math' && typeof node.value === 'string') {
        // Math nodes - remove & characters that cause KaTeX errors
        if (node.value.includes('&')) {
          node.value = node.value.replace(/&/g, ' ')
          console.log(`[remarkAlignEnvironments] fixed & in math node`)
        }
      } else if (node.type === 'html' && typeof node.value === 'string') {
        // HTML nodes - might contain escaped math content
        if (node.value.includes('&amp;') && (node.value.includes('\\int') || node.value.includes('\\begin'))) {
          node.value = node.value.replace(/&amp;(\s*\\)/g, ' $1')
          console.log(`[remarkAlignEnvironments] fixed &amp; in HTML node`)
        }
      } else if (node.type === 'text' && typeof node.value === 'string') {
        // Text nodes - fix any escaped math
        if (node.value.includes('&amp;') && node.value.includes('\\')) {
          node.value = node.value.replace(/&amp;(\s*\\)/g, ' $1')
          console.log(`[remarkAlignEnvironments] fixed &amp; in text node`)
        }
      }
    })
  }
}
