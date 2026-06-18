import type { Plugin } from 'vite'

/**
 * Convert aligned to align* for KaTeX compatibility
 *
 * KaTeX does not support the \begin{aligned} environment which requires
 * & as alignment markers. This plugin converts aligned → align* which
 * doesn't require alignment markers but still displays equations properly.
 *
 * Example:
 * Before: \begin{aligned} & expr \\
 *         {}={} & value \end{aligned}
 * After:  \begin{align*} expr \\ = value \end{align*}
 *
 * See: https://katex.org/docs/supported.html (no mention of aligned support)
 */
export function fixMdxAlignEnvironmentsPlugin(): Plugin {
  return {
    name: 'fix-mdx-align-environments',
    transform(code, id) {
      if (!id.endsWith('.mdx') && !id.endsWith('.md')) return null
      
      // Check for both escaped and unescaped forms
      const hasAligned = code.includes('\\begin{aligned}') || code.includes('\\\\begin{aligned}')
      const hasAlignedEscaped = code.includes('&amp;\\\\begin{aligned}') || code.includes('&amp;\\begin{aligned}')
      
      if (!hasAligned && !hasAlignedEscaped) return null

      const before = code
      let modified = code

      // Handle double-escaped backslashes from MDX processing
      // \\\\ becomes \\ in the actual content
      if (modified.includes('\\\\begin{aligned}')) {
        modified = modified.replace(/\\\\begin\{aligned\}/g, '\\\\begin{align*}')
        modified = modified.replace(/\\\\end\{aligned\}/g, '\\\\end{align*}')
      }

      // Handle single-escaped backslashes
      if (modified.includes('\\begin{aligned}')) {
        modified = modified.replace(/\\begin\{aligned\}/g, '\\begin{align*}')
        modified = modified.replace(/\\end\{aligned\}/g, '\\end{align*}')
      }

      // Remove & alignment markers (not needed in align*)
      // Handle both escaped and unescaped forms
      modified = modified.replace(/\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g, (match) => {
        return match.replace(/&\s*/g, '')
      })
      modified = modified.replace(/\\\\begin\{align\*\}([\s\S]*?)\\\\end\{align\*\}/g, (match) => {
        return match.replace(/&\s*/g, '')
      })

      if (modified !== before) {
        console.log(`[fixMdxAlign] converted aligned to align* in ${id.substring(id.lastIndexOf('/'))}`)
        return { code: modified }
      }
      return null
    },
  }
}
