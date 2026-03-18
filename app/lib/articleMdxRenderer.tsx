import { HTTPException } from 'hono/http-exception'
import { jsxRenderer } from 'hono/jsx-renderer'
import { X_HONO_DISABLE_SSG_HEADER_KEY } from 'hono/ssg'
import Article from '../components/Article'
import type { BreadcrumbItem } from '../components/Breadcrumb'
import { DIRECTORY_ICON, articlesByDirectory, normalizePublished } from './articles'
import type { ArticleLink } from './articles'

const DIRECTORY_SECTION: Record<keyof typeof articlesByDirectory, { label: string; href: string }> = {
  diary: { label: 'Diary', href: '/diary/index.html' },
  essays: { label: 'Essay', href: '/essays/index.html' },
  works: { label: 'Work', href: '/works/index.html' },
}

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
    return articlesByDirectory[key].map((a) => ({ ...a, icon }))
  }

  const relatedArticles = !isIndexPage && directoryKey ? getRelatedArticlesForDirectory(directoryKey) : undefined

  // 記事ページにはパンくずリストを表示してサイト内回遊を促進する
  const sectionNavItem = directoryKey ? DIRECTORY_SECTION[directoryKey] : undefined
  const breadcrumbItems: BreadcrumbItem[] | undefined =
    !isIndexPage && sectionNavItem
      ? [
          { label: 'Index', href: '/' },
          { label: sectionNavItem.label, href: sectionNavItem.href },
        ]
      : undefined

  return (
    <Layout frontmatter={frontmatter}>
      <Article relatedArticles={relatedArticles} currentPath={currentPath} breadcrumbItems={breadcrumbItems}>
        {children}
      </Article>
    </Layout>
  )
})
