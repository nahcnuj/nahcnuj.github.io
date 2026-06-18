import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Emergency fallback for alignment marker cleanup
 *
 * This is a secondary cleanup in case any & characters slip through the Vite
 * plugin transformation. Primary handling is done by fixMdxAlignEnvironmentsPlugin.
 *
 * This plugin runs AFTER remarkMath in the plugin chain.
 */
export const remarkAlignEnvironments: Plugin<[], Root> = () => {
  return (tree) => {
    // Only handle escaped ampersands in HTML nodes that might contain math
    visit(tree, (node: any) => {
      if (node.type === 'html' && typeof node.value === 'string' && node.value.includes('&amp;')) {
        if (node.value.includes('\\int') || node.value.includes('\\begin')) {
          node.value = node.value.replace(/&amp;(\s*)/g, '')
          console.log(`[remarkAlignEnvironments] cleaned up escaped ampersands in HTML node`)
        }
      }
    })
  }
}
