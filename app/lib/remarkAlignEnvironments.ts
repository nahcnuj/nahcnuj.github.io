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
        let hadAmpersand = false

        // First pass: remove ALL & characters from the entire math environment at line beginnings
        // This is critical because even in gathered/aligned, leading & causes KaTeX parse errors
        const lines = value.split('\n')
        const cleanedLines = lines.map(line => {
          // Remove & at the start of the line (with optional whitespace)
          if (line.match(/^\s*&/)) {
            hadAmpersand = true
            return line.replace(/^\s*&\s*/, '')
          }
          return line
        })
        value = cleanedLines.join('\n')

        if (hadAmpersand) {
          conversions++
          console.log(`[remarkAlignEnvironments] removed leading & from line beginnings`)
        }

        // For align* with &, convert to aligned for KaTeX compatibility
        value = value.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (match, content) => {
          // Remove remaining & alignment markers that weren't at line starts
          const cleanedContent = content.replace(/&/g, ' ')
          conversions++
          console.log(`[remarkAlignEnvironments] converted align to aligned`)
          return `\\begin{aligned}${cleanedContent}\\end{aligned}`
        })

        // Convert gather [star] to gathered, removing any remaining & characters
        value = value.replace(/\\begin\{gather\*?\}([\s\S]*?)\\end\{gather\*?\}/g, (_, content) => {
          const cleanedContent = content.replace(/&/g, ' ').trim()
          conversions++
          console.log(`[remarkAlignEnvironments] converted gather to gathered`)
          return `\\begin{gathered}${cleanedContent}\\end{gathered}`
        })

        // Clean up existing gathered environments - remove any remaining & characters
        value = value.replace(/\\begin\{gathered\}([\s\S]*?)\\end\{gathered\}/g, (match, content) => {
          if (content.includes('&')) {
            const cleanedContent = content.replace(/&/g, ' ').trim()
            conversions++
            console.log(`[remarkAlignEnvironments] cleaned & from gathered`)
            return `\\begin{gathered}${cleanedContent}\\end{gathered}`
          }
          return match
        })

        // Convert multline [star] to aligned
        value = value.replace(/\\begin\{multline\*?\}([\s\S]*?)\\end\{multline\*?\}/g, (_, content) => {
          const cleanedContent = content.replace(/&/g, ' ')
          conversions++
          console.log(`[remarkAlignEnvironments] converted multline to aligned`)
          return `\\begin{aligned}${cleanedContent}\\end{aligned}`
        })

        if (conversions > 0) {
          console.log(`[remarkAlignEnvironments] total conversions=${conversions}`)
        }

        node.value = value
      }
    })
  }
}
