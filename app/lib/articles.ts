import type { Frontmatter } from '../types'

declare const __normalizedDateBrand: unique symbol
/** A date string validated and normalized to `YYYY-MM-DD`. */
export type NormalizedDate = string & { readonly [__normalizedDateBrand]: true }

/**
 * Frontmatter for articles in diary/, essays/, and works/.
 * `published` is required and guaranteed to be a valid, `YYYY-MM-DD`-normalized date.
 */
export interface ArticleFrontmatter extends Frontmatter {
  published: NormalizedDate
}

export const DIRECTORY_ICON = {
  diary: '📓',
  works: '🧑‍💻',
  essays: '📝',
} as const

export interface ArticleLink {
  path: string
  title: string
  description?: string
  /** The icon emoji for this article's directory. */
  icon?: typeof DIRECTORY_ICON[keyof typeof DIRECTORY_ICON]
}

export interface ArticleFeedItem extends Pick<ArticleFrontmatter, 'title' | 'description' | 'published'> {
  path: string
}

/** Normalizes a frontmatter value into a `NormalizedDate` (`YYYY-MM-DD`),
 * or `undefined` if the value is missing or invalid. */
export function normalizePublished(value: unknown): NormalizedDate | undefined {
  if (typeof value !== 'string') return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString().split('T')[0] as NormalizedDate
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
    .map(([path, { frontmatter }]) => ({
      path: path.replace(pathPattern, `/${routePrefix}/`).replace(/\.mdx$/, ''),
      title: frontmatter.title,
      published: frontmatter.published,
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
    .map(([path, { frontmatter }]) => ({
      path: path.replace(pathPattern, `/${routePrefix}/`).replace(/\.mdx$/, ''),
      title: frontmatter.title,
      description: frontmatter.description,
    }))
    .sort((a, b) => a.path.localeCompare(b.path))
}

export const articlesByDirectory = {
  diary: createArticleList('diary'),
  essays: createArticleList('essays'),
  works: createArticleList('works'),
} as const
