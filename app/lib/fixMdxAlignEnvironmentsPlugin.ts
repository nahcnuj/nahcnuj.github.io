import type { Plugin } from 'vite'

/**
 * Fix KaTeX compatibility issues in aligned math environments
 *
 * This Vite plugin:
 * 1. Removes all & characters (alignment markers that KaTeX doesn't support)
 * 2. Flattens multiline aligned blocks by normalizing whitespace
 *
 * This runs at the source transformation level before MDX processing.
 */
export function fixMdxAlignEnvironmentsPlugin(): Plugin {
  return {
    name: 'fix-mdx-align-environments',
    transform(code, id) {
      if (!id.endsWith('.mdx') && !id.endsWith('.md')) return null
      if (!code.includes('\\begin{aligned')) return null

      const before = code
      let modified = code

      // Step 1: Remove all & characters
      modified = modified.replace(/&/g, '')
      console.log('[fixMdxAlign] removed all & characters')

      // Step 2: Flatten aligned environments
      // Match any aligned block with flexible whitespace
      modified = modified.replace(/\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/g, (match) => {
        // Remove newlines and excessive whitespace, but preserve \\
        const flattened = match
          .replace(/\n\s*/g, ' ') // newlines + spaces -> single space
          .replace(/\s+/g, ' ') // multiple spaces -> single space
        console.log('[fixMdxAlign] flattened aligned block, before=' + match.length + ' after=' + flattened.length)
        return flattened
      })

      if (modified !== before) {
        console.log(`[fixMdxAlign] processed aligned blocks in ${id.substring(id.lastIndexOf('/'))}`)
        return { code: modified }
      }
      return null
    },
  }
}
