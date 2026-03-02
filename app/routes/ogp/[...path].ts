import { Resvg } from '@resvg/resvg-js'
import { ssgParams } from 'hono/ssg'
import { createRoute } from 'honox/factory'
import { createArticleList } from '../../lib/articles'
import { AUTHOR_PHOTO_URL, SITE_URL, THEME_BASE_COLOR, THEME_MAIN_COLOR } from '../../lib/site'
import { wrapLines } from '../../lib/wrapLines'
import { escapeXml } from '../../lib/xmlEscape'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SITE_NAME = new URL(SITE_URL).host
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

function generateOgpSvg(title: string): string {
  const lines = wrapLines(title, 16)
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
        `  <text x="600" y="${Math.round(startY + i * lineHeight)}" font-family="'Hiragino Sans','Yu Gothic','Meiryo','Noto Sans CJK JP',sans-serif" font-size="${fontSize}" fill="${TEXT_COLOR}" text-anchor="middle">${escapeXml(line)}</text>`,
    )
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <clipPath id="ac">
      <circle cx="1110" cy="540" r="45"/>
    </clipPath>
  </defs>
  <rect width="1200" height="630" fill="${THEME_BASE_COLOR}"/>
  <rect x="20" y="20" width="1160" height="590" rx="24" fill="${THEME_MAIN_COLOR}"/>
${textElements}
  <text x="600" y="565" font-family="'Hiragino Sans','Yu Gothic','Meiryo','Noto Sans CJK JP',sans-serif" font-size="28" fill="${LABEL_COLOR}" text-anchor="middle">${SITE_NAME}</text>
  <image x="1065" y="495" width="90" height="90" href="${AUTHOR_PHOTO_URL}" clip-path="url(#ac)" preserveAspectRatio="xMidYMid slice"/>
</svg>`
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

function svgToPng(svg: string): Uint8Array {
  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: true,
    },
  })
  return resvg.render().asPng()
}

export default createRoute(
  ssgParams(allOgpPaths.map((p) => ({ path: `${p}.png` }))),
  (c) => {
    const rawPath = c.req.param('path') ?? ''
    const articlePath = rawPath.replace(/\.png$/, '')
    const title = getTitleForPath(articlePath)
    const png = svgToPng(generateOgpSvg(title))
    return c.body(png, 200, { 'Content-Type': 'image/png' })
  },
)
