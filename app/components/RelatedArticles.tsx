import { css } from 'hono/css'

import Icon from './Icon'

interface Article {
  path: string
  title: string
  icon?: string
}

interface RelatedArticlesProps {
  articles: Article[]
  currentPath: string
  maxItems?: number
  /** When true, skip internal shuffle/sort and display articles in the given order. */
  preserveOrder?: boolean
}

const relatedArticlesClass = css`
  margin-block-start: 3rem;
  padding: 1.5rem 1rem;
  width: 80%;

  & ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  & li {
    margin-block: 0.5rem;
    padding-inline-start: 0;
    display: flex;
    gap: 0.6rem;
    align-items: center;
    line-height: 1.2;
  }

  /* Icon inside related list should match text size */
  & li > span {
    display: inline-block;
    width: auto;
    text-align: left;
    font-size: 1rem;
    line-height: 1;
  }
`

export default function RelatedArticles({ articles, currentPath, maxItems, preserveOrder = false }: RelatedArticlesProps) {
  // 現在のページを除外
  const filteredArticles = articles.filter((article) => article.path !== currentPath)

  const limit = maxItems ?? filteredArticles.length

  let selectedArticles: Article[]
  if (preserveOrder) {
    // 渡された順序を維持して maxItems 件に絞る
    selectedArticles = filteredArticles.slice(0, limit)
  } else {
    // ランダムに記事を選択
    const shuffled = [...filteredArticles].sort(() => Math.random() - 0.5)
    selectedArticles = shuffled.slice(0, limit).sort((a, b) => a.path.localeCompare(b.path))
  }

  if (selectedArticles.length === 0) {
    return null
  }

  return (
    <div class={relatedArticlesClass}>
      <ul>
        {selectedArticles.map((article) => (
          <li key={article.path}>
            {article.icon ? <Icon>{article.icon}</Icon> : null}
            <a href={article.path}>{article.title}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
