import { css, Style } from 'hono/css'
import { html } from 'hono/html'
import type { PropsWithChildren } from 'hono/jsx'
import { Script } from 'honox/server'
import { THEME_BASE_COLOR, THEME_MAIN_COLOR } from '../lib/site'

interface OpenGraphData {
  url?: string
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
    --theme-base-color: ${THEME_BASE_COLOR};
    --theme-main-color: ${THEME_MAIN_COLOR};
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

const GA4_MEASUREMENT_ID = 'G-RMH8Q8RB96'

const gtagSnippets = {
  head: html`\
<link rel="preload" href="https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}" as="script">
`,
  body: html`\
<script src="https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}" async></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  const debugMode = typeof location !== 'undefined' && new URLSearchParams(location.search).get('_ga_debug') === '1';
  gtag('config', '${GA4_MEASUREMENT_ID}', debugMode ? { 'debug_mode': true } : {});
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

const OpenGraph = ({ url, image }: OpenGraphData) =>
  url || image ? (
    <>
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image.url} />}
      {image?.alt && <meta property="og:image:alt" content={image.alt} />}
    </>
  ) : null

const adsenseSnippet = html`\
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1645913691678081"
    crossorigin="anonymous"></script>
  `

const Layout = (props: PropsWithChildren<Meta>) => html`
<html lang="ja">
<head prefix="og: http://ogp.me/ns#">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="${THEME_MAIN_COLOR}">
  <title>${props.title}</title>
  ${props.description ? html`<meta name="description" content="${props.description}">` : html`<!-- -->`}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${props.title}">
  ${props.description ? html`<meta property="og:description" content="${props.description}">` : html`<!-- -->`}
  ${props.openGraph?.url && html`<link rel="canonical" href="${props.openGraph.url}">`}
  ${props.openGraph && <OpenGraph url={props.openGraph.url} image={props.openGraph.image} />}
  <meta name="twitter:card" content="summary_large_image">
  ${<Script src="/app/client.ts" async />}
  ${<Style>{rootStyle}</Style>}
  <link rel="alternate" type="application/rss+xml" title="www.nahcnuj.work" href="/feed.xml">
  ${import.meta.env.PROD && gtagSnippets.head}\
  ${import.meta.env.PROD && ninjaAccessSnippets.head}\
  ${import.meta.env.PROD && adsenseSnippet}\
  ${props.useMath && html`\
  <link rel="preload" href="https://mathfonts.github.io/LatinModern/latinmodern-math.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="https://mathfonts.github.io/LatinModern/mathfonts.css">
  <style>
    math{font-family:Latin Modern Math,serif}
    math[display=block]{margin-block:1rem}
    .tml-left{text-align:left}
  </style>
`}\
  ${props.headInjection}\
</head>
<body>
  ${props.children}
  ${import.meta.env.PROD ? gtagSnippets.body : html`<!-- -->\n`}\
  ${import.meta.env.PROD ? ninjaAccessSnippets.body : html`<!-- -->\n`}\
</body>
</html>
`

export default Layout
