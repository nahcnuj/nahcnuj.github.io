import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Convert aligned to align* for KaTeX compatibility
 *
 * KaTeX does not support the \begin{aligned} environment which requires
 * & as alignment markers. This plugin converts aligned → align* which
 * doesn't require alignment markers but still displays equations properly.
 *
 * This plugin intercepts MDX files at load time to ensure early processing.
 *
 * Example:
 * Before: \begin{aligned} & expr \\
 *         {}={} & value \end{aligned}
 * After:  \begin{align*} expr \\ = value \end{align*}
 */

/**
 * Convert aligned to align* for KaTeX compatibility
 *
 * KaTeX does not support the \begin{aligned} environment which requires
 * & as alignment markers. This plugin converts aligned → align* which
 * doesn't require alignment markers but still displays equations properly.
 *
 * This plugin intercepts MDX files at load time to ensure early processing.
 *
 * Example:
 * Before: \begin{aligned} & expr \\
 *         {}={} & value \end{aligned}
 * After:  \begin{align*} expr \\ = value \end{align*}
 */
export function fixMdxAlignEnvironmentsPlugin(): Plugin {
  const mdxFiles = new Map<string, { original: string; processed: string }>()
  
  const processContent = (code: string, id: string) => {
    // Check for both escaped and unescaped forms
    const hasAligned = code.includes('\\begin{aligned}') || code.includes('\\\\begin{aligned}')
    
    if (!hasAligned) return code

    let modified = code

    // Handle single-escaped backslashes (most common in MDX files)
    if (modified.includes('\\begin{aligned}')) {
      modified = modified.replace(/\\begin\{aligned\}/g, '\\begin{align*}')
      modified = modified.replace(/\\end\{aligned\}/g, '\\end{align*}')
      
      // Remove & alignment markers (not needed in align*)
      modified = modified.replace(/\$\$([\s\S]*?)\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}([\s\S]*?)\$\$/g, (match) => {
        return match.replace(/&\s*/g, '')
      })
    }

    if (modified !== code) {
      const shortId = id.length > 80 ? '...' + id.substring(id.length - 60) : id
      console.log(`[fixMdxAlign] ✓ processed ${shortId}`)
      return modified
    }
    return code
  }
  
  return {
    name: 'fix-mdx-align-environments-load',
    
    // Use resolveId to intercept .mdx files
    resolveId(id) {
      if (id.endsWith('.mdx') || id.endsWith('.md')) {
        // Return undefined to let default resolver handle it,
        // but we'll intercept in load hook
        return undefined
      }
      return undefined
    },
    
    // Use load hook to read and process files
    load(id) {
      if (!id.endsWith('.mdx') && !id.endsWith('.md')) return null
      
      try {
        // Resolve the actual file path
        const filePath = resolve(id)
        
        // Read the file
        const content = readFileSync(filePath, 'utf-8')
        
        // Process for aligned environments
        const processed = processContent(content, id)
        
        // Store for later verification
        mdxFiles.set(id, { original: content, processed })
        
        // Return processed content
        if (processed !== content) {
          return processed
        }
      } catch (_e) {
        // Silently ignore errors and let normal loading happen
        console.log(`[fixMdxAlign] Could not load file: ${id}`)
      }
      
      return null
    },
  }
}
