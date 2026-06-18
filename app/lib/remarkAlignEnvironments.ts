import type { Root } from 'mdast'
import type { Plugin } from 'unified'
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

        // CRITICAL FIX: Remove ALL & alignment markers from aligned/aligned/gathered/etc
        // KaTeX has a parse error when & appears at position 1: "Expected 'EOF', got '&'"
        // The & character is only for alignment and isn't necessary - we can just remove it
        
        // Remove ALL & characters globally - they cause KaTeX parse errors
        if (value.includes('&')) {
          value = value.replace(/&/g, ' ')
          conversions++
          console.log(`[remarkAlignEnvironments] removed ALL & alignment markers`)
        }

        // Still convert unsupported environments to supported ones for compatibility
        // For align* environments, convert to aligned
        value = value.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (match, content) => {
          conversions++
          console.log(`[remarkAlignEnvironments] converted align to aligned`)
          return `\\begin{aligned}${content}\\end{aligned}`
        })

        // Convert gather [star] to gathered
        value = value.replace(/\\begin\{gather\*?\}([\s\S]*?)\\end\{gather\*?\}/g, (_, content) => {
          conversions++
          console.log(`[remarkAlignEnvironments] converted gather to gathered`)
          return `\\begin{gathered}${content.trim()}\\end{gathered}`
        })

        // Convert multline [star] to aligned
        value = value.replace(/\\begin\{multline\*?\}([\s\S]*?)\\end\{multline\*?\}/g, (_, content) => {
          conversions++
          console.log(`[remarkAlignEnvironments] converted multline to aligned`)
          return `\\begin{aligned}${content}\\end{aligned}`
        })

        if (conversions > 0) {
          console.log(`[remarkAlignEnvironments] total conversions=${conversions}`)
        }

        node.value = value
      }
    })
  }
}
