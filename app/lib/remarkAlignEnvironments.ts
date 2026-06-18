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
    let mathNodeCount = 0
    visit(tree, 'math', (node) => {
      mathNodeCount++
      if (typeof node.value === 'string') {
        const content = node.value
        const first100 = content.substring(0, 100).replace(/\n/g, ' ').replace(/&/g, '&AMP;')
        console.log(`[remarkAlign #${mathNodeCount}] input (first 100): ${first100}`)
        
        let value = content
        let conversions = 0

        // Remove ALL & characters - they cause KaTeX parse error at position 1
        if (value.includes('&')) {
          value = value.replace(/&/g, ' ')
          conversions++
          console.log(`[remarkAlign #${mathNodeCount}] removed & markers`)
        }

        // Convert unsupported environments to KaTeX-compatible ones
        value = value.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (_, content) => {
          conversions++
          console.log(`[remarkAlign #${mathNodeCount}] converted align to aligned`)
          return `\\begin{aligned}${content}\\end{aligned}`
        })

        value = value.replace(/\\begin\{gather\*?\}([\s\S]*?)\\end\{gather\*?\}/g, (_, content) => {
          conversions++
          console.log(`[remarkAlign #${mathNodeCount}] converted gather to gathered`)
          return `\\begin{gathered}${content.trim()}\\end{gathered}`
        })

        value = value.replace(/\\begin\{multline\*?\}([\s\S]*?)\\end\{multline\*?\}/g, (_, content) => {
          conversions++
          console.log(`[remarkAlign #${mathNodeCount}] converted multline to aligned`)
          return `\\begin{aligned}${content}\\end{aligned}`
        })

        if (conversions > 0) {
          console.log(`[remarkAlign #${mathNodeCount}] total conversions=${conversions}`)
        }
        
        const afterFirst100 = value.substring(0, 100).replace(/\n/g, ' ').replace(/&/g, '&AMP;')
        console.log(`[remarkAlign #${mathNodeCount}] output (first 100): ${afterFirst100}`)

        node.value = value
      }
    })
  }
}
