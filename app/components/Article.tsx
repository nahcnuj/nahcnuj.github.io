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
    margin-block: calc(var(--line-height) * 1rem);
    padding-bottom: 1pt; /* for bottom border */
    background: linear-gradient(#ccf 0.5pt, transparent 0.5pt) top/100% calc(var(--line-height) * 1rem);
  }

  & figure {
    max-width: 80%;
    margin-inline: auto;
    text-align: center;

    & img {
      object-fit: scale-down;
    }
  }
`

export default function Article({ children }: PropsWithChildren) {
  return <article class={articleClass}>{children}</article>
}
