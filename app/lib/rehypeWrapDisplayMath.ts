import type { Element, Root } from 'hast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Mark display math elements with 'katex-display' class.
 * 
 * Strategy: Check for structural complexity indicators that indicate display math:
 * - Fractions, matrices, multiple lines
 * - TeX environments like split, gathered, aligned
 * - Long content (likely display)
 * 
 * This is a simplified version focused on high-confidence display math detection.
 */
export const rehypeWrapDisplayMath: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (
        node.tagName === 'span' &&
        Array.isArray(node.properties?.className) &&
        (node.properties.className as string[]).includes('katex')
      ) {
        // Find the mathml content
        const mathmlNode = node.children.find(
          (child) =>
            (child as Element).tagName === 'span' &&
            Array.isArray((child as Element).properties?.className) &&
            ((child as Element).properties?.className as string[]).includes('katex-mathml'),
        ) as Element | undefined

        if (mathmlNode) {
          const mathNode = mathmlNode.children.find(
            (child) => (child as Element).tagName === 'math',
          ) as Element | undefined

          if (mathNode) {
            const mathStr = JSON.stringify(mathNode)
            
            // Get TeX annotation to check for display environments
            const annotations = mathmlNode.children
              .filter((child) => (child as Element).tagName === 'annotation')
              .find((child) => (child as Element).properties?.encoding === 'application/x-tex') as
              | Element
              | undefined

            const texContent = (annotations?.children?.[0] as any)?.value || ''

            // High-confidence display math indicators:
            // 1. Contains fractions (structural complexity)
            // 2. Contains matrices/tables (multi-row)
            // 3. Contains known display environments
            const isDisplayMath =
              mathStr.includes('mfrac') || // fractions
              mathStr.includes('mtable') || // matrices/arrays
              /^(aligned|split|gathered|align\*|displaystyle)/.test(texContent.trim()) ||
              (texContent.length > 50 && (mathStr.includes('msup') || mathStr.includes('msub'))) // complex multiline-ish

            if (isDisplayMath) {
              if (!Array.isArray(node.properties?.className)) {
                node.properties ??= {}
                node.properties.className = []
              }
              if (
                !((node.properties.className as string[]).includes('katex-display'))
              ) {
                (node.properties.className as string[]).push('katex-display')
              }
            }
          }
        }
      }
    })
  }
}
