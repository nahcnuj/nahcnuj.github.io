import type { Root } from 'hast'
import type { Plugin } from 'unified'

/**
 * rehypeKatex already handles marking display vs inline math correctly.
 * This plugin is intentionally a no-op to rely on KaTeX's built-in behavior.
 * 
 * KaTeX adds 'katex-display' class for display math ($$...$$)
 * and no special class for inline math ($...$)
 */
export const rehypeWrapDisplayMath: Plugin<[], Root> = () => {
  return (tree) => {
    // No-op: KaTeX plugin handles display math classification
    // Adding additional heuristics was causing inline math to be marked as display
  }
}
