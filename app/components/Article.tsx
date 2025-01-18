import { css } from 'hono/css'
import { raw } from 'hono/html'
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

  &, & honox-island {
    & > p, & > ul, & > ol {
      padding-block-end: 0.5pt;
      background: linear-gradient(#ccf 0.5pt, transparent 0.5pt) top/100% var(--line-height-length);
    }
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
    line-height: 1.5;
  }

  & code {
    font-size: 1em;
  }

  & p code {
    font-size: 1rem;
  }
`

const admaxPcClass = css`
  height: 100%;
  margin-inline: calc(50% - 50vw);
  text-align:center;
  background-color: var(--theme-base-color);

  display:grid;
  justify-items:center;
  align-content:space-around;

  @media screen and (max-width: 727px) {
    display: none;
  }
`
const admaxSpClass = css`
  diplay: none;
  overflow:hidden;

  @media screen and (max-width: 727px) {
    height: 100%;
    text-align: center;
    background-color: var(--theme-base-color);
  }
`

export default function Article({ children }: PropsWithChildren) {
  return (
  <article class={articleClass}>
    <aside style="height:100px">
      <div class={admaxPcClass}>
        <script src="https://adm.shinobi.jp/s/77ca5fd1df959f6aa2a66d62614ed055" />
      </div>
      <div class={admaxSpClass}>
        <script src="https://adm.shinobi.jp/s/b793489d3737a35ef887cf42c4816d28" />
      </div>
    </aside>
    {children}
    <aside style="height:100px;margin-top:1rem">
      <div class={admaxPcClass}>
        <div class="admax-ads" data-admax-id="51cc1d947d0361fc6e0d31fd3ec72795" style="display:inline-block;width:728px;height:90px;" />
        <script type="text/javascript">{raw`(admaxads = window.admaxads || []).push({admax_id: "51cc1d947d0361fc6e0d31fd3ec72795",type: "banner"});`}</script>
        <script type="text/javascript" charset="utf-8" src="https://adm.shinobi.jp/st/t.js" async />
      </div>
      <div class={admaxSpClass}>
        <div class="admax-ads" data-admax-id="fa1a228bb42d976cd5bb39f31c407c30" style="display:inline-block;" />
        <script type="text/javascript">{raw`(admaxads = window.admaxads || []).push({admax_id: "fa1a228bb42d976cd5bb39f31c407c30",type: "banner"});`}</script>
        <script type="text/javascript" charset="utf-8" src="https://adm.shinobi.jp/st/t.js" async />
      </div>
    </aside>
  </article>
  )
}
