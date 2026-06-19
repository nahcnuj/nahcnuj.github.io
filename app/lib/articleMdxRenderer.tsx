import { HTTPException } from 'hono/http-exception'
import { jsxRenderer } from 'hono/jsx-renderer'
import { X_HONO_DISABLE_SSG_HEADER_KEY } from 'hono/ssg'
import Article from '../components/Article'
import { DIRECTORY_ICON, articlesByDirectory, normalizePublished } from './articles'
import type { ArticleLink } from './articles'
import { pickRandomN } from './random'

// component passed to jsxRenderer is loosely typed; ignore TS complaints
// @ts-expect-error
export const articleMdxRenderer = jsxRenderer(({ Layout, children, frontmatter }, c) => {
  const currentPath = c.req.path

  // If a document lacks a valid `published` date we should not render it at
  // all; disable SSG output and return 404 so nothing is generated.
  if (!frontmatter || !normalizePublished(frontmatter.published)) {
    c.header(X_HONO_DISABLE_SSG_HEADER_KEY, 'true')
    throw new HTTPException(404)
  }

  // index.htmlページの場合は関連記事を表示しない
  const isIndexPage = currentPath.endsWith('/index.html')

  // 現在のパスに基づいて適切な記事リストを選択
  const directoryKey = Object.keys(articlesByDirectory).find((key) => currentPath.startsWith(`/${key}/`)) as
    | keyof typeof articlesByDirectory
    | undefined

  const getRelatedArticlesForDirectory = (key?: keyof typeof articlesByDirectory): ArticleLink[] | undefined => {
    if (!key) return undefined
    const icon = DIRECTORY_ICON[key]
    const all = articlesByDirectory[key].filter((a) => a.path !== currentPath).map((a) => ({ ...a, icon }))
    return pickRandomN(all, 5).sort((a, b) => a.path.localeCompare(b.path))
  }

  const relatedArticles = !isIndexPage && directoryKey ? getRelatedArticlesForDirectory(directoryKey) : undefined

  return (
    <Layout frontmatter={frontmatter}>
      <Article relatedArticles={relatedArticles} currentPath={currentPath}>
        {children}
      </Article>
    </Layout>
  )
})
