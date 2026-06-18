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

        // AGGRESSIVE FIRST PASS: Remove ALL & characters that cause KaTeX parse errors
        // & at position 1 is the problem we're seeing
        
        // Remove & from the very beginning of the math block
        const hasLeadingAmp = value.match(/^&\s+/)
        if (hasLeadingAmp) {
          value = value.replace(/^&\s+/, '')
          conversions++
          console.log(`[remarkAlignEnvironments] removed leading & from block start`)
        }

        // Remove & from beginning of any line
        const lines = value.split('\n')
        let lineCleanups = 0
        const cleanedLines = lines.map(line => {
          const beforeClean = line
          const cleaned = line.replace(/^\s*&\s+/, '')
          if (cleaned !== beforeClean) {
            lineCleanups++
          }
          return cleaned
        })
        
        if (lineCleanups > 0) {
          value = cleanedLines.join('\n')
          conversions++
          console.log(`[remarkAlignEnvironments] removed leading & from ${lineCleanups} lines`)
        }

        // For align* environments, convert to aligned
        value = value.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (match, content) => {
          const cleanedContent = content.replace(/&/g, ' ')
          conversions++
          console.log(`[remarkAlignEnvironments] converted align to aligned`)
          return `\\begin{aligned}${cleanedContent}\\end{aligned}`
        })

        // Convert gather [star] to gathered
        value = value.replace(/\\begin\{gather\*?\}([\s\S]*?)\\end\{gather\*?\}/g, (_, content) => {
          const cleanedContent = content.replace(/&/g, ' ').trim()
          conversions++
          console.log(`[remarkAlignEnvironments] converted gather to gathered`)
          return `\\begin{gathered}${cleanedContent}\\end{gathered}`
        })

        // Clean up existing gathered environments
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

        // Final safety check: make sure no & remains at the start
        if (value.match(/^&/)) {
          value = value.replace(/^&\s*/, '')
          conversions++
          console.log(`[remarkAlignEnvironments] removed remaining leading &`)
        }

        if (conversions > 0) {
          console.log(`[remarkAlignEnvironments] total conversions=${conversions}`)
        }

        node.value = value
      }
    })
  }
}
