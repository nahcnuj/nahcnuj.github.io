// reuse shared Frontmatter definition for common fields
import type { Frontmatter } from '../types'

// we export this interface so that unit tests can construct artificial
// file lists without having to redeclare the whole shape.
export interface ArticleFrontmatter extends Frontmatter {
  // make `published` required for articles in diary/essays/works
  /**
   * ISO-style publication date.  The source MDX files in diary/, essays,
   * and works/ are required to provide this property.  The value is
   * normalized to the `YYYY-MM-DD` portion of `Date.prototype.toISOString()`.
   */
  published: string
}

export interface ArticleLink {
  path: string
  title: string
  icon?: string
}

export interface ArticleFeedItem {
  path: string
  title: string
  published: string
  description?: string
}

// アイコン定義（ディレクトリキー -> emoji）
export const DIRECTORY_ICON: Record<string, string> = {
  diary: '📓',
  works: '🧑‍💻',
  essays: '📝',
}

// 全ディレクトリの記事を一括取得
// - 通常は `app/routes/**` を読み込みます
// - 開発時（vite dev）のみ `app/fixtures/**` を追加で読み込み、動作確認用の記事を提供します
// NOTE: the value is typed with `ArticleFrontmatter` but the glob may still
// load files missing `published` because TypeScript can't enforce frontmatter
// at build time.  We filter later.
const allArticleFiles = import.meta.env.DEV
  ? import.meta.glob<{ frontmatter: ArticleFrontmatter }>('../{routes,fixtures}/**/*.mdx', { eager: true })
  : import.meta.glob<{ frontmatter: ArticleFrontmatter }>('../routes/**/*.mdx', { eager: true })

// normalize a value from frontmatter into a canonical date string
// or `undefined` if the value is missing/invalid.  Accepts `YYYY-MM-DD` and
// any other format that `new Date(...)` recognizes (ISO 8601, with or
// without time/timezone).
export function normalizePublished(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  // only keep the date portion; this keeps the representation consistent
  // even if the author supplied a time or timezone component.
  return d.toISOString().split('T')[0]
}

/** Helper used by articleMdxRenderer to decide whether rendering should occur. */
export function hasValidPublished(frontmatter: { published?: unknown }): boolean {
  return normalizePublished(frontmatter?.published) !== undefined
}

// フィード用記事リスト生成のヘルパー関数（公開日を含む）
// `files` parameter is exported purely for unit tests.
export function createFeedItems(
  routePrefix: string,
  files: Record<string, { frontmatter: ArticleFrontmatter }> = allArticleFiles,
): ArticleFeedItem[] {
  const pathPattern = new RegExp(`^../(?:routes|fixtures)/${routePrefix}/`)
  return Object.entries(files)
    .filter(([path]) => path.includes(`/routes/${routePrefix}/`))
    .filter(([, { frontmatter }]) => hasValidPublished(frontmatter))
    .map(([path, { frontmatter }]) => ({
      path: path.replace(pathPattern, `/${routePrefix}/`).replace(/\.mdx$/, ''),
      title: frontmatter.title,
      published: normalizePublished(frontmatter.published) as string,
      description: frontmatter.description,
    }))
    .sort((a, b) => b.published.localeCompare(a.published))
}

// 記事リスト生成のヘルパー関数
// `files` parameter is exported purely for unit tests; callers in the
// application omit it and the default (`allArticleFiles`) is used.
export function createArticleList(
  routePrefix: string,
  files: Record<string, { frontmatter: ArticleFrontmatter }> = allArticleFiles,
): ArticleLink[] {
  const pathPattern = new RegExp(`^../(?:routes|fixtures)/${routePrefix}/`)
  return (
    Object.entries(files)
      .filter(([path]) => path.includes(`/routes/${routePrefix}/`) || path.includes(`/fixtures/${routePrefix}/`))
      // only keep articles with a valid published date
      .filter(([, { frontmatter }]) => hasValidPublished(frontmatter))
      .map(([path, { frontmatter }]) => ({
        path: path.replace(pathPattern, `/${routePrefix}/`).replace(/\.mdx$/, ''),
        title: frontmatter.title,
      }))
      .sort((a, b) => a.path.localeCompare(b.path))
  )
}

// 各ディレクトリの記事を取得
export const articlesByDirectory = {
  diary: createArticleList('diary'),
  essays: createArticleList('essays'),
  works: createArticleList('works'),
} as const
