import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import type { Element, Root } from 'hast'

/**
 * Add display math marker class to complex math elements
 * This allows CSS to style them as block-level
 */
export const rehypeWrapDisplayMath: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (
        node.tagName === 'span' &&
        Array.isArray(node.properties?.className) &&
        (node.properties.className as string[]).includes('katex')
      ) {
        // Check if this is display math based on content
        const mathmlNode = node.children.find(
          (child) =>
            (child as Element).tagName === 'span' &&
            Array.isArray((child as Element).properties?.className) &&
            ((child as Element).properties?.className as string[]).includes('katex-mathml'),
        ) as Element | undefined

        if (mathmlNode) {
          const mathml = mathmlNode.children.find(
            (child) => (child as Element).tagName === 'math',
          ) as Element | undefined

          if (mathml) {
            const content = JSON.stringify(mathml)
            
            // Detect display math by complexity indicators
            const isDisplayMath =
              content.includes('mfrac') ||  // fractions
              content.includes('msup') ||   // superscripts  
              content.includes('msub') ||   // subscripts
              content.length > 200          // overall complexity

            if (isDisplayMath) {
              // Add display class
              const classes = Array.isArray(node.properties?.className)
                ? [...(node.properties.className as string[])]
                : []
              
              if (!classes.includes('katex-display')) {
                classes.push('katex-display')
              }
              
              if (!node.properties) {
                node.properties = {}
              }
              node.properties.className = classes
            }
          }
        }
      }
    })
  }
}
