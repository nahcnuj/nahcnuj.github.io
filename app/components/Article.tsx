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

    & + & {
      margin-block-start: 0;
    }

    & + p, & + ul, & + ol, & + dl {
      margin-block-start: 0;
    }
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
