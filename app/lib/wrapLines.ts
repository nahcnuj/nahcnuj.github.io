/**
 * Wrap `text` into at most 3 lines.
 * Word-boundary splitting is tried first (for English titles); CJK titles are
 * split at character positions since they have no spaces.
 * If any individual word exceeds `maxLen`, falls back to character-boundary
 * splitting so every returned line is bounded by `maxLen`.
 */
export function wrapLines(text: string, maxLen = 20): string[] {
  if (text.length <= maxLen) return [text]

  const words = text.split(' ')
  if (words.length > 1 && words.every((w) => w.length <= maxLen)) {
    // Word-boundary split
    const lines: string[] = []
    let cur = ''
    for (let i = 0; i < words.length; i++) {
      const w = words[i]
      if (!cur) {
        cur = w
        continue
      }
      if (cur.length + 1 + w.length <= maxLen) {
        cur += ` ${w}`
      } else {
        lines.push(cur)
        cur = w
        if (lines.length === 2) {
          // Third line: append remaining words (truncating if too long)
          const remaining = words.slice(i).join(' ')
          lines.push(remaining.length <= maxLen ? remaining : `${remaining.slice(0, maxLen - 1)}…`)
          return lines
        }
      }
    }
    if (cur) lines.push(cur)
    return lines.slice(0, 3)
  }

  // Character-boundary split (CJK, or any word exceeds maxLen)
  const lines: string[] = []
  for (let i = 0; i < text.length; i += maxLen) {
    const chunk = text.slice(i, i + maxLen)
    if (lines.length === 2 && i + maxLen < text.length) {
      lines.push(`${chunk.slice(0, maxLen - 1)}…`)
      break
    }
    lines.push(chunk)
  }
  return lines.slice(0, 3)
}
