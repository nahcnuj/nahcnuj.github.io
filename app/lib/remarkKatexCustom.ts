/**
 * Remark plugin - remark-math handles the math node creation
 * This file is kept for reference but the actual rendering
 * is handled by the rehype plugin
 */
export function remarkKatexCustom() {
  // remark-math plugin already handles math detection
  // We don't need to do anything here - just return identity
  return (tree: any) => {
    // No-op: remark-math already created the math nodes
  }
}
