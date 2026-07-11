import { css } from 'hono/css'

import Icon from './Icon'

interface Article {
  path: string
  title: string
  icon?: string
}

interface RelatedArticlesProps {
  articles: Article[]
}

/** Affiliate / PR entry mixed into the related-articles list. */
export const RELATED_PR_AD = {
  path: 'https://adf.shinobi.jp/r/4fac3bdc31d17f46c61074e4e72894b6',
  title: '【PR】最短4分で広告を掲載できる『忍者AdMax』',
} as const satisfies Article

function isExternalPath(path: string): boolean {
  return /^https?:\/\//.test(path)
}

/**
 * Insert the PR entry among related articles at a stable position (second slot when
 * there is at least one article). Deterministic so SSG/VRT snapshots do not flake.
 */
export function mixRelatedPrAd(articles: Article[], item: Article = RELATED_PR_AD): Article[] {
  const items = [...articles]
  const index = items.length > 0 ? 1 : 0
  items.splice(index, 0, item)
  return items
}

const relatedArticlesClass = css`
  padding: 1.5rem 1rem;

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

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null
  }

  const items = mixRelatedPrAd(articles)

  return (
    <div class={relatedArticlesClass}>
      <ul>
        {items.map((article) => {
          const external = isExternalPath(article.path)
          return (
            <li key={article.path}>
              {article.icon ? <Icon>{article.icon}</Icon> : null}
              <a
                href={article.path}
                {...(external
                  ? { target: '_blank', rel: 'noopener noreferrer sponsored' }
                  : {})}
              >
                {article.title}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
