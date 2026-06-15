import type { Element, Root } from 'hast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

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
          const mathml = mathmlNode.children.find((child) => (child as Element).tagName === 'math') as
            | Element
            | undefined

          if (mathml) {
            const content = JSON.stringify(mathml)
            
            // Get the original TeX annotation to detect structural elements
            const semantics = mathml as Element
            const annotations = semantics.children?.filter(
              (child) => (child as Element).tagName === 'annotation' && 
                        (child as Element).properties?.encoding === 'application/x-tex'
            ) as Element[] | undefined
            
            const texContent = annotations?.[0]?.children?.[0]?.value as string | undefined || ''

            // Detect display math by complexity indicators:
            // 1. Structural elements (fractions, matrices, subscripts, etc.)
            // 2. Environment markers in TeX (cases, matrix, array, etc.)
            // 3. Content length and operator density
            const isDisplayMath =
              // Fractions, superscripts, subscripts
              content.includes('mfrac') ||
              content.includes('msup') ||
              content.includes('msub') ||
              content.includes('msubsup') ||
              // Limits and decorations
              content.includes('munder') ||
              content.includes('mover') ||
              content.includes('munderover') ||
              // Matrix-like structures
              content.includes('mtable') ||
              content.includes('mtr') ||
              content.includes('mtd') ||
              // Complex expressions
              (content.includes('mrow') && content.length > 80) ||
              (content.match(/mo>/g) || []).length > 3 ||
              content.length > 150 ||
              // TeX environment markers - these are most reliable
              texContent.includes('\\frac') ||
              texContent.includes('\\int') ||
              texContent.includes('\\sum') ||
              texContent.includes('\\prod') ||
              texContent.includes('\\begin{') ||
              texContent.includes('\\cases') ||
              texContent.includes('\\matrix') ||
              texContent.includes('\\array') ||
              // More than 50 characters indicates substantial formula
              texContent.length > 50

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
