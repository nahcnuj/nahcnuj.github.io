import { Style, css } from 'hono/css'
import { html } from 'hono/html'
import type { PropsWithChildren } from 'hono/jsx'
import { Script } from 'honox/server'

interface OpenGraphData {
  image?: {
    url: string
    alt?: string
  }
}

type Meta = {
  title: string
  description?: string
  openGraph?: OpenGraphData
  useMath?: boolean
  headInjection?: unknown
}

const rootStyle = css`
  :root {
    --theme-base-color: #e6e6ff;
    --theme-main-color: #000033;
    --theme-accent-color: #ff6666;

    scroll-behavior: smooth;
    scroll-padding-block-start: 4em;
  }

  * {
    text-underline-position: from-font;
    text-decoration-thickness: from-font;
  }

  html, body { margin: 0; padding: 0; }

  html {
    background: var(--theme-base-color);
    color: var(--theme-main-color);

    scrollbar-gutter: stable;
  }

  a:visited {
    color: var(--theme-main-color);
  }
  a:active, a:hover {
    color: var(--theme-accent-color);
  }
`

const gtagSnippets = {
  head: html`\
<link rel="preload" href="https://www.googletagmanager.com/gtag/js?id=G-RMH8Q8RB96" as="script">
`,
  body: html`\
<script src="https://www.googletagmanager.com/gtag/js?id=G-RMH8Q8RB96" async></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-RMH8Q8RB96');
</script>
`,
} as const

const ninjaAccessSnippets = {
  head: html`\
<link rel="preload" href="https://x4.shinobi.jp/ufo/060401300" as="script">
`,
  body: html`\
<script type="text/javascript" src="//x4.shinobi.jp/ufo/060401300"></script>
<noscript>
  <a href="//x4.shinobi.jp/bin/gg?060401300" target="_blank" rel="noreferrer">
    <img src="//x4.shinobi.jp/bin/ll?060401300" border="0" alt="">
  </a>
  <br>
  <span style="font-size:9px">
    <img style="margin:0;vertical-align:text-bottom;" src="//img.shinobi.jp/tadaima/fj.gif" width="19" height="11" alt="">
  </span>
</noscript>
`,
} as const

const OpenGraph = ({ image }: OpenGraphData) =>
  image ? (
    <>
      <meta property="og:image" content={image.url} />
      {image.alt && <meta property="og:image:alt" content={image.alt} />}
    </>
  ) : null

const Layout = (props: PropsWithChildren<Meta>) => html`
<html lang="ja">
<head prefix="og: http://ogp.me/ns#">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title}</title>
  ${props.description ? html`<meta name="description" content="${props.description}">` : html`<!-- -->`}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${props.title}">
  ${props.description ? html`<meta property="og:description" content="${props.description}">` : html`<!-- -->`}
  ${props.openGraph && <OpenGraph image={props.openGraph.image} />}
  ${<Script src="/app/client.ts" async />}
  ${<Style>{rootStyle}</Style>}
  ${import.meta.env.PROD ? gtagSnippets.head : html`<!-- -->\n`}\
  ${import.meta.env.PROD ? ninjaAccessSnippets.head : html`<!-- -->\n`}\
  ${props.headInjection}\
  ${
    props.useMath &&
    html`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css" integrity="sha384-zh0CIslj+VczCZtlzBcjt5ppRcsAmDnRem7ESsYwWwg3m/OaJ2l4x7YBZl9Kxxib" crossorigin="anonymous">`
  }\
</head>
<body>
  ${props.children}
  ${import.meta.env.PROD ? gtagSnippets.body : html`<!-- -->\n`}\
  ${import.meta.env.PROD ? ninjaAccessSnippets.body : html`<!-- -->\n`}\
</body>
</html>
`

export default Layout
