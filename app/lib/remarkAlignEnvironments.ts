import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Fix alignment markers for KaTeX compatibility
 *
 * This plugin MUST run AFTER remarkMath in the plugin chain to process math nodes.
 * It converts \begin{aligned} to \begin{align*} since KaTeX doesn't support aligned.
 *
 * Note: This runs on the AST after math nodes are created by remarkMath
 */
export const remarkAlignEnvironments: Plugin<[], Root> = () => {
  return (tree) => {
    // Visit all nodes (not just math nodes) since content might be at various levels
    visit(tree, (node: any) => {
      // Handle math nodes created by remarkMath
      if (node.type === 'math' && typeof node.value === 'string') {
        if (node.value.includes('\\begin{aligned}')) {
          // Convert \begin{aligned} to \begin{align*}
          node.value = node.value.replace(/\\begin\{aligned\}/g, '\\begin{align*}')
          node.value = node.value.replace(/\\end\{aligned\}/g, '\\end{align*}')
          
          // Remove & alignment markers (not needed in align*)
          node.value = node.value.replace(/&\s*/g, '')
          
          console.log(`[remarkAlign] converted aligned to align* in math node`)
        }
      }
      
      // Also handle escaped ampersands in HTML/text nodes as safety net
      if (node.type === 'html' && typeof node.value === 'string' && node.value.includes('&amp;')) {
        if (node.value.includes('\\int') || node.value.includes('\\begin')) {
          node.value = node.value.replace(/&amp;(\s*)/g, '')
          console.log(`[remarkAlign] cleaned up escaped ampersands in HTML node`)
        }
      }
    })
  }
}
