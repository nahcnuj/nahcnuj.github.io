import type { Frontmatter } from '../types'

/**
 * Frontmatter for articles in diary/, essays/, and works/.
 * `published` is required and normalized to `YYYY-MM-DD`.
 */
export interface ArticleFrontmatter extends Frontmatter {
  published: string
}

export interface ArticleLink {
  path: string
  title: string
  /** The icon emoji for this article's directory (e.g. '📓'). */
  icon?: string
}

export interface ArticleFeedItem extends Pick<ArticleFrontmatter, 'title' | 'description'> {
  path: string
  published: string
}

export const DIRECTORY_ICON: Record<string, string> = {
  diary: '📓',
  works: '🧑‍💻',
  essays: '📝',
}

/** Normalizes a frontmatter value into a canonical `YYYY-MM-DD` date string,
 * or `undefined` if the value is missing or invalid. */
export function normalizePublished(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString().split('T')[0]
}

/** Returns true if `frontmatter.published` is a valid date string. */
export function hasValidPublished(frontmatter: { published?: unknown }): boolean {
  return normalizePublished(frontmatter?.published) !== undefined
}

// 全ディレクトリの記事を一括取得し、publishedを正規化済みの値に変換する
// - 通常は `app/routes/**` を読み込みます
// - 開発時（vite dev）のみ `app/fixtures/**` を追加で読み込みます
const allArticleFiles: Record<string, { frontmatter: ArticleFrontmatter }> = Object.fromEntries(
  Object.entries(
    import.meta.env.DEV
      ? import.meta.glob<{ frontmatter: Frontmatter }>('../{routes,fixtures}/**/*.mdx', { eager: true })
      : import.meta.glob<{ frontmatter: Frontmatter }>('../routes/**/*.mdx', { eager: true }),
  ).flatMap(([path, mod]) => {
    const published = normalizePublished(mod.frontmatter.published)
    if (published === undefined) return []
    return [[path, { frontmatter: { ...mod.frontmatter, published } as ArticleFrontmatter }]]
  }),
)

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

export function createArticleList(
  routePrefix: string,
  files: Record<string, { frontmatter: ArticleFrontmatter }> = allArticleFiles,
): ArticleLink[] {
  const pathPattern = new RegExp(`^../(?:routes|fixtures)/${routePrefix}/`)
  return Object.entries(files)
    .filter(([path]) => path.includes(`/routes/${routePrefix}/`) || path.includes(`/fixtures/${routePrefix}/`))
    .filter(([, { frontmatter }]) => hasValidPublished(frontmatter))
    .map(([path, { frontmatter }]) => ({
      path: path.replace(pathPattern, `/${routePrefix}/`).replace(/\.mdx$/, ''),
      title: frontmatter.title,
    }))
    .sort((a, b) => a.path.localeCompare(b.path))
}

export const articlesByDirectory = {
  diary: createArticleList('diary'),
  essays: createArticleList('essays'),
  works: createArticleList('works'),
} as const
