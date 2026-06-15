import type { Plugin } from 'unified'
import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

/**
 * Convert multi-line environments for KaTeX compatibility
 *
 * rehype-katex doesn't handle top-level align [*], align, gather [*], gather, multline [*]
 * Convert them to split/gathered which are KaTeX-safe inside display math
 *
 * See: https://github.com/remarkjs/remark-math/issues/11
 */
export const remarkAlignEnvironments: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'math', (node) => {
      if (typeof node.value === 'string') {
        let value = node.value
        let conversions = 0

        // Pre-process: escape & in align environments to avoid HTML escaping issues
        // Convert align/align* with multi-line alignment to array environment
        value = value.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (fullMatch, content) => {
          conversions++
          // Replace & with & (keep as is) and \\ with line breaks
          // array environment with aligned cells
          return `\\begin{array}{l}
${content.replace(/\\\\/g, ' \\\\').replace(/&/g, '')}
\\end{array}`
        })

        // Convert gather/gather* - similar approach
        value = value.replace(/\\begin\{gather\*?\}([\s\S]*?)\\end\{gather\*?\}/g, (fullMatch, content) => {
          conversions++
          return `\\begin{gathered}${content}\\end{gathered}`
        })

        // Convert multline/multline* to aligned
        value = value.replace(/\\begin\{multline\*?\}([\s\S]*?)\\end\{multline\*?\}/g, (_, content) => {
          conversions++
          return `\\begin{aligned}${content}\\end{aligned}`
        })

        if (conversions > 0) {
          console.log(`[remarkAlignEnvironments] ${conversions} conversions in math block`)
        }

        node.value = value
      }
    })
  }
}

