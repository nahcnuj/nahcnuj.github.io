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
        const originalValue = node.value
        let value = node.value
        let conversions = 0

        // Convert align [star] to split
        value = value.replace(/\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g, (_, content) => {
          conversions++
          return `\\begin{split}${content}\\end{split}`
        })

        // Convert align to split
        value = value.replace(/\\begin\{align\}([\s\S]*?)\\end\{align\}/g, (_, content) => {
          conversions++
          return `\\begin{split}${content}\\end{split}`
        })

        // Convert gather [star] to gathered
        value = value.replace(/\\begin\{gather\*\}([\s\S]*?)\\end\{gather\*\}/g, (_, content) => {
          conversions++
          return `\\begin{gathered}${content}\\end{gathered}`
        })

        // Convert gather to gathered
        value = value.replace(/\\begin\{gather\}([\s\S]*?)\\end\{gather\}/g, (_, content) => {
          conversions++
          return `\\begin{gathered}${content}\\end{gathered}`
        })

        // Convert multline [star] to split
        value = value.replace(/\\begin\{multline\*\}([\s\S]*?)\\end\{multline\*\}/g, (_, content) => {
          conversions++
          return `\\begin{split}${content}\\end{split}`
        })

        // Convert multline to split
        value = value.replace(/\\begin\{multline\}([\s\S]*?)\\end\{multline\}/g, (_, content) => {
          conversions++
          return `\\begin{split}${content}\\end{split}`
        })

        if (conversions > 0) {
          console.log(`[remarkAlignEnvironments] ${conversions} conversions in math block`)
        }

        node.value = value
      }
    })
  }
}

