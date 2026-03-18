import { css } from 'hono/css'

export interface BreadcrumbItem {
  label: string
  href?: string
}

const breadcrumbClass = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3em;
  list-style: none;
  margin: 0;
  margin-block-end: 0.5em;
  padding: 0;
  padding-inline: 0.2rem;
  padding-block: 0.5em;
  font-size: 0.9em;
`

const separatorClass = css`
  opacity: 0.5;
  user-select: none;
`

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="breadcrumb">
      <ol class={breadcrumbClass}>
        {items.map((item, i) => (
          <li key={item.label} style="display:inline-flex;align-items:center;gap:0.3em;">
            {i > 0 && (
              <span class={separatorClass} aria-hidden="true">
                /
              </span>
            )}
            {item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
