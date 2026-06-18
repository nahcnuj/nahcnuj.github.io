import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Convert multi-line environments for KaTeX compatibility
 *
 * This plugin MUST run AFTER remarkMath in the plugin chain to process math nodes.
 * It removes & alignment markers that cause KaTeX parse errors.
 *
 * See: https://github.com/remarkjs/remark-math/issues/11
 */
export const remarkAlignEnvironments: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'math', (node) => {
      if (typeof node.value === 'string') {
        let value = node.value
        let conversions = 0

        // Remove ALL & characters - they cause KaTeX parse error at position 1
        if (value.includes('&')) {
          value = value.replace(/&/g, ' ')
          conversions++
          console.log(`[remarkAlignEnvironments] removed & alignment markers`)
        }

        // Convert unsupported environments to KaTeX-compatible ones
        // For align* environments, convert to aligned
        value = value.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (_, content) => {
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
