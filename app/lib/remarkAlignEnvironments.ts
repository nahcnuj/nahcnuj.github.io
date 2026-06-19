import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Fix alignment markers for KaTeX compatibility
 *
 * This plugin MUST run AFTER remarkMath in the plugin chain to process math nodes.
 * It removes alignment markers (&) that KaTeX's align* doesn't support.
 *
 * Note: This runs on the AST after math nodes are created by remarkMath
 */
export const remarkAlignEnvironments: Plugin<[], Root> = () => {
  return (tree) => {
    let mathNodeCount = 0
    let alignedCount = 0
    let ampersandCount = 0
    
    // Visit all nodes to find math nodes
    visit(tree, 'math', (node: any) => {
      mathNodeCount++
      const content = node.value ?? ''
      
      // Count and remove all ampersand alignment markers
      const ampCount = (content.match(/&/g) || []).length
      if (ampCount > 0) {
        ampersandCount += ampCount
        
        // Remove ALL alignment markers - both & and &= patterns
        node.value = content.replace(/&/g, '')
        
        console.log(`[remarkAlign] Removed ${ampCount} alignment markers from math node`)
      }
      
      // Track align environment conversions if any
      if (content.includes('\\begin{aligned}')) {
        alignedCount++
        node.value = node.value.replace(/\\begin\{aligned\}/g, '\\begin{align*}')
        node.value = node.value.replace(/\\end\{aligned\}/g, '\\end{align*}')
        console.log(`[remarkAlign] Converted aligned to align*`)
      }
    })
    
    if (mathNodeCount > 0) {
      console.log(`[remarkAlign] Summary: processed ${mathNodeCount} math nodes, removed ${ampersandCount} ampersands, ${alignedCount} align conversions`)
    }
  }
}
