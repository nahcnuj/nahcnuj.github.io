import { jsxRenderer } from 'hono/jsx-renderer'
import { X_HONO_DISABLE_SSG_HEADER_KEY } from 'hono/ssg'
import Article from '../components/Article'
import { DIRECTORY_ICON, articlesByDirectory, normalizePublished } from './articles'
import type { ArticleLink } from './articles'

// component passed to jsxRenderer is loosely typed; ignore TS complaints
// @ts-expect-error
export const articleMdxRenderer = jsxRenderer(({ Layout, children, frontmatter }, c) => {
  const currentPath = c.req.path

  // If a document lacks a valid `published` date we should not render it at
  // all; disable SSG output and return 404 so nothing is generated.
  if (!frontmatter || !normalizePublished(frontmatter.published)) {
    c.header(X_HONO_DISABLE_SSG_HEADER_KEY, 'true')
    return c.notFound()
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
    return articlesByDirectory[key].map((a) => ({ ...a, icon }))
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
