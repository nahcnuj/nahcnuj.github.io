import { css, html } from 'hono/css'
import { jsxRenderer } from 'hono/jsx-renderer'
import { X_HONO_DISABLE_SSG_HEADER_KEY } from 'hono/ssg'

// reuse shared Frontmatter definition for common fields
import type { Frontmatter } from '../types'
import AdMax from './AdMax'
import RelatedArticles from './RelatedArticles'

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

interface ArticleLink {
  path: string
  title: string
  icon?: string
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

const articleClass = css`
  --line-height: 2;
  --line-height-length: calc(var(--line-height) * 1rem);
  line-height: var(--line-height-length);
  @supports (line-height-step: 1px) {
    line-height-step: var(--line-height-length);
  }

  & h1, & h2, & h3, & h4, & h5, & h6, & p, & ul, & ol, & dl, & div {
    box-sizing: border-box;
    margin-block: 0;
    line-height: inherit;
  }

  & h1, & h2, & h3, & h4, & h5, & h6, & p {
    padding-inline: 0.2rem;
  }

  & > ul, & > ol, & > dl {
    padding-inline-end: 0.2rem;
  }

  & h2, & h3, & h4, & h5, & h6 {
    margin-block-start: 2rem;
    margin-block-end: 0;

    & + & {
      margin-block-start: 0.5rem;
    }
  }

  & h1 { font-size: 200% }
  & h2 { font-size: 160% }
  & h3 { font-size: 120% }

  & h2 { margin-block-end: 0.5rem }

  & h1 {
    margin-block: 2rem;
    padding-block: 0.5rem;
    border-block: 2pt solid var(--theme-main-color);
    background: var(--theme-base-color);
    line-height: 1.5;
  }

  & h3::before {
    content: "■";
    margin-inline-end: 0.3ex;
  }

  & p, & li, & dd {
    text-align: left;
  }

  & p + p {
    margin-block-start: var(--line-height-length);
  }

  &, & honox-island {
    & > p, & > ul, & > ol {
      padding-block-end: 0.5pt;
      background: linear-gradient(#ccf 0.5pt, transparent 0.5pt) top/100% var(--line-height-length);
    }
  }

  & figure {
    max-width: 80%;
    margin-inline: auto;
    text-align: center;

    & img {
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 100%;
      object-fit: scale-down;
    }
  }

  & pre {
    box-sizing: border-box;
    margin-inline: 0.5rem;
    padding-block: calc(var(--line-height-length) / 4 - 2pt);
    padding-inline: 0.75em;
    border: 1pt solid var(--theme-main-color);
    border-radius: 0.5rem;
    overflow-x: scroll;
    scrollbar-width: none;
    font-size: 1rem;
    line-height: 1.5;
  }

  & code {
    padding: 0.25em;
    font-size: 1em;
    overflow-wrap: anywhere;
  }

  & p code {
    font-size: 1rem;
  }
`

export default function Article({
  children,
  relatedArticles,
  currentPath,
}: {
  // the JSX renderer gives us a `Child` (string, element, null, …); we
  // only inspect `children` at runtime, so allow any value here.
  // biome-ignore lint/suspicious/noExplicitAny: runtime type check only
  children?: any
  relatedArticles?: ArticleLink[]
  currentPath?: string
}) {
  // biome-ignore lint/suspicious/noExplicitAny: internal traversal of JSX tree
  const childArray = children && Array.isArray((children as any).children) ? (children as any).children : undefined

  if (Array.isArray(childArray)) {
    const newChildren = []
    let paragraphCount = 0

    for (const child of childArray) {
      if (
        child.type === 'p' ||
        child.type === 'h3' ||
        child.type === 'h4' ||
        child.type === 'pre' ||
        child.type === 'div'
      ) {
        paragraphCount++
        if (paragraphCount >= 7) {
          newChildren.push(
            <AdMax height="270px">
              {html`
<!-- admax -->
<div class="admax-switch" data-admax-id="70a63675255ffbb9d4ac3fedd2a19b3d" style="display:inline-block;"></div>
<script type="text/javascript">
(admaxads = window.admaxads || []).push({admax_id: "70a63675255ffbb9d4ac3fedd2a19b3d",type: "switch"});</script>
${'' /*<script type="text/javascript" charset="utf-8" src="https://adm.shinobi.jp/st/t.js" async></script>*/}\
<!-- admax -->
`}
            </AdMax>,
          )
          paragraphCount = 0
        }
      }
      newChildren.push(child)
    }
    children.children = newChildren
  }

  return (
    <article class={articleClass}>
      {children}
      {relatedArticles && relatedArticles.length > 0 && currentPath && (
        <>
          <h2>他の記事</h2>
          <RelatedArticles articles={relatedArticles} currentPath={currentPath} />
        </>
      )}
    </article>
  )
}

// component passed to jsxRenderer is loosely typed; ignore TS complaints
// @ts-expect-error
export const articleMdxRenderer = jsxRenderer(({ Layout, children, frontmatter }, c) => {
  const currentPath = c.req.path

  // If a document lacks a valid `published` date we should not render it at
  // all; disable SSG output and return 404 so nothing is generated.
  if (!frontmatter || !hasValidPublished(frontmatter)) {
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
        {/* children may be undefined; JSX accepts it */}
        {children}
      </Article>
    </Layout>
  )
})
