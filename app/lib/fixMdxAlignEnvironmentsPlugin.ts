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
import type { Plugin } from 'vite'

/**
 * Convert aligned to align* for KaTeX compatibility
 *
 * KaTeX does not support the \begin{aligned} environment which requires
 * & as alignment markers. This plugin converts aligned → align* which
 * doesn't require alignment markers but still displays equations properly.
 *
 * This plugin uses both 'load' and 'transform' hooks to ensure it processes
 * files regardless of how Vite loads them.
 *
 * Example:
 * Before: \begin{aligned} & expr \\
 *         {}={} & value \end{aligned}
 * After:  \begin{align*} expr \\ = value \end{align*}
 */
export function fixMdxAlignEnvironmentsPlugin(): Plugin {
  const processFile = (code: string, id: string) => {
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
      const shortId = id.length > 100 ? '...' + id.substring(id.length - 80) : id
      console.log(`[fixMdxAlign] ✓ converted aligned to align* in ${shortId}`)
      return modified
    }
    return null
  }
  
  return {
    name: 'fix-mdx-align-environments',
    
    // Use load hook to catch files before other plugins
    async load(id) {
      if (!id.endsWith('.mdx') && !id.endsWith('.md')) return null
      
      // Only log files that contain aligned
      if (id.includes('align')) {
        const shortId = id.length > 100 ? '...' + id.substring(id.length - 80) : id
        console.log(`[fixMdxAlign] load hook called for ${shortId}`)
      }
      return null // Return null to let other plugins handle the actual load
    },
    
    // Also use transform hook for redundancy
    transform(code, id) {
      if (!id.endsWith('.mdx') && !id.endsWith('.md')) return null
      
      const result = processFile(code, id)
      if (result) {
        return { code: result }
      }
      return null
    },
  }
}
