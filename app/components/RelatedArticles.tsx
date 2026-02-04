import { css } from 'hono/css'

interface Article {
  path: string
  title: string
}

interface RelatedArticlesProps {
  articles: Article[]
  currentPath: string
  maxItems?: number
}

const relatedArticlesClass = css`
  margin-block-start: 3rem;
  padding: 1.5rem 1rem;
  border-top: 2pt solid var(--theme-main-color);
  background: var(--theme-base-color);

  & h2 {
    margin-block: 0 1rem;
    font-size: 140%;
  }

  & ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  & li {
    margin-block: 0.5rem;
    padding-inline-start: 1em;
    text-indent: -1em;
  }

  & li::before {
    content: "📄 ";
  }

  & a {
    color: var(--theme-main-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

export default function RelatedArticles({ articles, currentPath, maxItems = 5 }: RelatedArticlesProps) {
  // 現在のページを除外
  const filteredArticles = articles.filter((article) => article.path !== currentPath)

  // ランダムに記事を選択
  const shuffled = [...filteredArticles].sort(() => Math.random() - 0.5)
  const selectedArticles = shuffled.slice(0, maxItems)

  if (selectedArticles.length === 0) {
    return null
  }

  return (
    <div class={relatedArticlesClass}>
      <h2>関連記事</h2>
      <ul>
        {selectedArticles.map((article) => (
          <li key={article.path}>
            <a href={article.path}>{article.title}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
