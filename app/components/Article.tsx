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

  & h1 {
    box-sizing: border-box;
    height: calc(2 * var(--line-height-length));
    margin-block-end: var(--line-height-length);
    border-block: 2pt solid var(--theme-main-color);
    background: var(--theme-base-color);
    line-height: calc(2 * var(--line-height-length));
  }

  & h2, & h3, & h4, & h5, & h6 {
    padding-block-start: var(--line-height-length);

    & + & {
      padding-block-start: 0;
    }
  }

  & h2, & h3, & h4, & h5, & h6, & p, & ul, & ol, & dl, & div {
    margin-block: 0;
    line-height: inherit;
  }

  & h3::before {
    content: "■";
    margin-inline-end: 0.5ex;
  }

  & p, & li, & dd {
    text-align: justify;
  }

  & p {
    padding-inline: 0.5em;

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
`

export default function Article({ children }: PropsWithChildren) {
  return <article class={articleClass}>{children}</article>
}
