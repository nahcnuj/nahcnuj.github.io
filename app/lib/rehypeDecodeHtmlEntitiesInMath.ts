import type { Root } from 'hast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Decode HTML entities in raw math nodes before KaTeX processing
 * This is necessary because MDX escapes & to &amp; before rehype processing
 */
export const rehypeDecodeHtmlEntitiesInMath: Plugin<[], Root> = () => {
  return (tree) => {
    // Get the processor to access raw math nodes if possible
    // But since we're in rehype phase, we need to handle HAST nodes

    // This won't work for raw math nodes since KaTeX hasn't processed them yet
    // So we need a different approach - handle it at the text content level
    
    let modifications = 0
    visit(tree, 'element', (node: any) => {
      // Look for katex-related attributes or content
      if (node.properties?.className?.includes?.('math')) {
        visit(node, 'text', (textNode) => {
          const original = textNode.value
          textNode.value = textNode.value.replace(/&amp;/g, '&')
          if (textNode.value !== original) {
            modifications++
          }
        })
      }
    })

    if (modifications > 0) {
      console.log(`[rehypeDecodeHtmlEntitiesInMath] Decoded ${modifications} math text nodes`)
    }
  }
}


