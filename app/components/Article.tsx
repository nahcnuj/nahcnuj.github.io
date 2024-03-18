import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

const articleClass = css`
  --line-height: 2;
  line-height: calc(var(--line-height) * 1rem);

  & h1 {
    margin-block: calc(var(--line-height) * 1rem);
    padding-block: 0.5rem;
    border-block: 2pt solid var(--theme-main-color);
  }

  & p {
    padding-bottom: 1pt; /* for border */
    background: linear-gradient(#ccf 0.5pt, transparent 0.5pt) top/100% calc(var(--line-height) * 1rem);
  }
`

export default function Article({ children }: PropsWithChildren) {
  return <article class={articleClass}>{children}</article>
}
