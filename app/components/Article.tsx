import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

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
    text-align: justify;
  }

  & p + p {
    margin-block-start: var(--line-height-length);
  }

  & > p, & > ul, & > ol {
    padding-block-end: 1pt;
    background: linear-gradient(#ccf 0.5pt, transparent 0.5pt) top/100% var(--line-height-length);
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
  }

  & code {
    font-size: 1rem;
  }
`

export default function Article({ children }: PropsWithChildren) {
  return <article class={articleClass}>{children}</article>
}
