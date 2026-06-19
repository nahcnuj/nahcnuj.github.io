import { fromHtml } from 'hast-util-from-html'
import katex from 'katex'
import { visit } from 'unist-util-visit'

/**
 * Custom rehype plugin for rendering math expressions using KaTeX 0.17.0
 * Processes code elements with math-related classes from remark-math → MDX
 */
export function rehypeKatexCustom() {
  return (tree: any) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'code') return

      // Check for math indicators
      const classList = node.properties?.className ?? []
      const hasLanguageMath = classList.includes('language-math')
      const isMathDisplay = classList.includes('math-display')
      const isMathInline = classList.includes('math-inline')

      if (!hasLanguageMath && !isMathDisplay && !isMathInline) return

      // Extract math content
      const mathContent =
        node.children
          ?.filter((child: any) => child.type === 'text')
          .map((child: any) => child.value)
          .join('') ?? ''

      if (!mathContent.trim()) return

      try {
        const displayMode = isMathDisplay || (parent?.tagName === 'pre' && hasLanguageMath)

        // Render using KaTeX 0.17.0
        const html = katex.renderToString(mathContent, {
          displayMode,
          throwOnError: false,
          output: 'mathml',
          trust: true,
        })

        // Convert HTML string to hast nodes
        const renderedNodes = fromHtml(html, { fragment: true })

        if (displayMode && parent?.tagName === 'pre') {
          // For display mode: replace <pre><code>...</code></pre> with div
          parent.tagName = 'div'
          parent.properties = { className: ['katex-display'] }
          parent.children = renderedNodes.children
        } else {
          // For inline mode: replace code with span
          node.tagName = 'span'
          node.properties = { className: ['katex'] }
          node.children = renderedNodes.children
        }
      } catch (error) {
        console.warn(`KaTeX rendering error for: ${mathContent.substring(0, 50)}...`, error)
        // Keep original on error but mark it
        node.properties = {
          ...node.properties,
          className: [...classList, 'katex-error'],
          style: 'color:#cc0000',
        }
      }
    })
  }
}
