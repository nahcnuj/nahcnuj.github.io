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

        // For align* with &, replace & with placeholder before transformation
        // This prevents MDX from HTML-escaping the & character
        value = value.replace(/\\begin\{align\*?\}([\s\S]*?)\\end\{align\*?\}/g, (match, content) => {
          // Keep the aligned environment but decode/re-escape properly
          // Replace & with a placeholder temporarily
          const placeholder = '\x00AMPERSAND\x00'
          const protected_content = content.replace(/&/g, placeholder)
          conversions++
          // Use aligned which supports the alignment
          return `\\begin{aligned}${protected_content}\\end{aligned}`
        })

        // Convert gather [star] to gathered, completely removing & characters
        value = value.replace(/\\begin\{gather\*?\}([\s\S]*?)\\end\{gather\*?\}/g, (_, content) => {
          // Remove ALL & characters from gather environment  
          const cleanedContent = content.replace(/&/g, ' ').trim()
          conversions++
          console.log(`[remarkAlignEnvironments] removed & from gather`)
          return `\\begin{gathered}${cleanedContent}\\end{gathered}`
        })

        // Also clean up already-existing gathered environments by removing & characters
        value = value.replace(/\\begin\{gathered\}([\s\S]*?)\\end\{gathered\}/g, (match, content) => {
          // Check if content has & and remove it
          if (content.includes('&')) {
            const cleanedContent = content.replace(/&/g, ' ').trim()
            conversions++
            console.log(`[remarkAlignEnvironments] removed & from existing gathered`)
            return `\\begin{gathered}${cleanedContent}\\end{gathered}`
          }
          return match
        })

        // Convert multline [star] to aligned
        value = value.replace(/\\begin\{multline\*?\}([\s\S]*?)\\end\{multline\*?\}/g, (_, content) => {
          const protectedContent = content.replace(/&/g, '\uFFFD')
          conversions++
          return `\\begin{aligned}${protectedContent}\\end{aligned}`
        })

        if (conversions > 0) {
          console.log(`[remarkAlignEnvironments] conversions=${conversions}`)
        }

        node.value = value
      }
    })
  }
}
