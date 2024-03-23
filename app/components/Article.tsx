import { css } from 'hono/css'
import type { PropsWithChildren } from 'hono/jsx'

const articleClass = css`
  --line-height: 2;
  --line-height-length: calc(var(--line-height) * 1rem);
  line-height: var(--line-height-length);
  @supports (line-height-step: 1px) {
    line-height-step: var(--line-height-length);
  }

  background: linear-gradient(#ccf 0.5pt, transparent 0.5pt) top/100% var(--line-height-length);
  padding-block-end: 1pt;

  & h1, & h2, & h3, & h4, & h5, & h6, & p, & ul, & ol, & dl, & div {
    box-sizing: border-box;
    margin-block: 0;
    line-height: inherit;
  }

  & h1 {
    margin-block: calc(var(--line-height-length) - 2pt);
    padding-inline: 0.2rem;
    border-block: 2pt solid var(--theme-main-color);
    background: var(--theme-base-color);
    line-height: calc(2 * var(--line-height-length));
    font-size: 190%;

    & + h2 {
      margin-block-start: 0;
    }
  }

  & h2, & h3, & h4, & h5, & h6 {
    margin-block-start: var(--line-height-length);
    padding-inline: 0.2rem;

    & + & {
      margin-block-start: 0;
    }

    & + p, & + ul, & + ol, & + dl {
      margin-block-start: 0;
    }
  }

  & h3::before {
    content: "■";
    margin-inline-end: 0.3ex;
  }

  & p, & li, & dd {
    text-align: justify;
  }

  & p {
    margin-block-end: -1pt;
    padding-block-end: 1pt;
    padding-inline: 0.2rem;

    & + & {
      margin-block-start: var(--line-height-length);
    }
  }

  & figure {
    max-width: 80%;
    line-height: inherit;
    margin-inline: auto;
    text-align: center;

    & img {
      object-fit: scale-down;
    }
  }

  & pre {
    box-sizing: border-box;
    margin-block: calc(var(--line-height-length) / 4 + 1pt);
    margin-inline: 0.5rem;
    padding-block: calc(var(--line-height-length) / 4 - 2pt);
    padding-inline: 0.75em;
    border: 1pt solid var(--theme-main-color);
    border-radius: 0.5rem;
    background: var(--theme-base-color);
    overflow-x: scroll;
    scrollbar-width: none;
    line-height: inherit;
    font-size: 1rem;
  }

  & code {
    font-size: 1rem;
  }
`

export default function Article({ children }: PropsWithChildren) {
  return <article class={articleClass}>{children}</article>
}
