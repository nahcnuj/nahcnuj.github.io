import { ssgParams } from 'hono/ssg'
import { createRoute } from 'honox/factory'
import { createArticleList } from '../../lib/articles'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SITE_NAME = 'nahcnuj.work'
const BG_COLOR = '#e6e6ff'
const DARK_COLOR = '#000033'
const TEXT_COLOR = '#ffffff'
const LABEL_COLOR = '#aaaaff'

// ---------------------------------------------------------------------------
// Static titles for non-article pages
// ---------------------------------------------------------------------------

const STATIC_TITLES: Record<string, string> = {
  index: '林 純一 (Junichi Hayashi)',
  'diary/index': 'Diary',
  'works/index': 'Work',
  'essays/index': 'Essay',
}

// ---------------------------------------------------------------------------
// Build a path → title map from all MDX article files
// (createArticleList already handles dev/prod glob and published filtering)
// ---------------------------------------------------------------------------

const allSections = ['diary', 'essays', 'works'] as const
const articleTitleByPath: Record<string, string> = {}
for (const section of allSections) {
  for (const article of createArticleList(section)) {
    articleTitleByPath[article.path.replace(/^\//, '')] = article.title
  }
}

function getTitleForPath(path: string): string {
  return STATIC_TITLES[path] ?? articleTitleByPath[path] ?? SITE_NAME
}

// ---------------------------------------------------------------------------
// Paths to generate at SSG time
// ---------------------------------------------------------------------------

const articlePaths = Object.keys(articleTitleByPath)
const allOgpPaths = [...Object.keys(STATIC_TITLES), ...articlePaths]

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Wrap `text` into at most 3 lines.
 * Word-boundary splitting is tried first (for English titles); CJK titles are
 * split at character positions since they have no spaces.
 */
export function wrapLines(text: string, maxLen = 20): string[] {
  if (text.length <= maxLen) return [text]

  const words = text.split(' ')
  if (words.length > 1) {
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

  // Character-boundary split (CJK)
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

function generateOgpSvg(title: string): string {
  const lines = wrapLines(title)
  const n = lines.length
  const fontSize = n === 1 ? 72 : n === 2 ? 60 : 52
  const lineHeight = fontSize * 1.4
  const totalHeight = n * lineHeight

  // Center title vertically, shifted slightly upward to leave room for the label
  const centerY = 285
  const startY = centerY - totalHeight / 2 + fontSize * 0.85

  const textElements = lines
    .map(
      (line, i) =>
        `  <text x="600" y="${Math.round(startY + i * lineHeight)}" font-family="'Hiragino Sans','Yu Gothic','Meiryo','Noto Sans CJK JP',sans-serif" font-size="${fontSize}" fill="${TEXT_COLOR}" text-anchor="middle">${xmlEscape(line)}</text>`,
    )
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG_COLOR}"/>
  <rect x="20" y="20" width="1160" height="590" rx="24" fill="${DARK_COLOR}"/>
${textElements}
  <text x="600" y="565" font-family="'Hiragino Sans','Yu Gothic','Meiryo',sans-serif" font-size="28" fill="${LABEL_COLOR}" text-anchor="middle">${SITE_NAME}</text>
</svg>`
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export const GET = createRoute(
  ssgParams(allOgpPaths.map((p) => ({ path: `${p}.svg` }))),
  (c) => {
    const rawPath = c.req.param('path') ?? ''
    const articlePath = rawPath.replace(/\.svg$/, '')
    const title = getTitleForPath(articlePath)
    return c.body(generateOgpSvg(title), 200, { 'Content-Type': 'image/svg+xml; charset=utf-8' })
  },
)
