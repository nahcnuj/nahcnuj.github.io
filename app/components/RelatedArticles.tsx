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

export default function RelatedArticles({ articles, currentPath }: RelatedArticlesProps) {
  // 現在のページを除外
  const selectedArticles = articles.filter((article) => article.path !== currentPath)

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
