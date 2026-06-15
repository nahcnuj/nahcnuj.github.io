import type { Plugin } from 'unified'
import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

/**
 * Convert align* and similar multi-line environments to split or aligned equivalents
 * that KaTeX actually supports at the top level
 *
 * align* -> split (within $$...$$)
 * align -> split (within $$...$$)
 * gather* -> gathered (within $$...$$)
 * multline* -> not supported, convert to split
 */
export const remarkAlignEnvironments: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'math', (node) => {
      if (typeof node.value === 'string') {
        let value = node.value

        // Convert align* to split (align* doesn't number, split is equivalent)
        value = value.replace(
          /\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g,
          (_, content) => {
            // Preserve alignment indicators and line breaks
            return `\\begin{split}${content}\\end{split}`
          }
        )

        // Convert align to split (convert numbered to unnumbered for simplicity)
        value = value.replace(
          /\\begin\{align\}([\s\S]*?)\\end\{align\}/g,
          (_, content) => {
            return `\\begin{split}${content}\\end{split}`
          }
        )

        // Convert gather* to gathered
        value = value.replace(
          /\\begin\{gather\*\}([\s\S]*?)\\end\{gather\*\}/g,
          (_, content) => {
            return `\\begin{gathered}${content}\\end{gathered}`
          }
        )

        // Convert gather to gathered
        value = value.replace(
          /\\begin\{gather\}([\s\S]*?)\\end\{gather\}/g,
          (_, content) => {
            return `\\begin{gathered}${content}\\end{gathered}`
          }
        )

        // Convert multline* to split (multline is not well supported)
        value = value.replace(
          /\\begin\{multline\*\}([\s\S]*?)\\end\{multline\*\}/g,
          (_, content) => {
            return `\\begin{split}${content}\\end{split}`
          }
        )

        // Convert multline to split
        value = value.replace(
          /\\begin\{multline\}([\s\S]*?)\\end\{multline\}/g,
          (_, content) => {
            return `\\begin{split}${content}\\end{split}`
          }
        )

        node.value = value
      }
    })
  }
}
