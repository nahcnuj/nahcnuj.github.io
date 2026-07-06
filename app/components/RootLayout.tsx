import { css, Style } from 'hono/css'
import { html } from 'hono/html'
import type { PropsWithChildren } from 'hono/jsx'
import ClientScript from './ClientScript'
import { ADSENSE_CLIENT_ID, THEME_BASE_COLOR, THEME_MAIN_COLOR } from '../lib/site'

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
  /** When true, inject the AdSense loader in non-production builds (e.g. download-link fixtures). */
  downloadAdPopup?: boolean
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
    text-decoration-skip-ink: none;
    text-decoration-thickness: from-font;
    text-underline-offset: 0.1rem;
    text-underline-position: from-font;
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

  .download-ad-button {
    border: none;
    padding: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }

  .download-ad-button:active,
  .download-ad-button:hover {
    color: var(--theme-accent-color);
  }

  .download-ad-dialog {
    display: none;
    position: fixed;
    inset: 0;
    width: min(100% - 2rem, 28rem);
    height: fit-content;
    margin: auto;
    padding: 1.5rem;
    border: none;
    border-radius: 0.5rem;
    background: var(--theme-base-color, #e6e6ff);
    color: var(--theme-main-color, #000047);
    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.2);
    font-family: inherit;
  }

  .download-ad-dialog:popover-open {
    display: block;
  }

  .download-ad-dialog p {
    margin: 0 0 1rem;
    padding-inline-end: 2rem;
    font-size: 1.1rem;
    line-height: 1.4;
  }

  .download-ad-dialog .download-ad-container {
    min-height: 250px;
    margin-block-end: 0.5rem;
    display: flex;
    justify-content: center;
  }

  .download-ad-dialog .download-ad-actions {
    display: flex;
    justify-content: flex-end;
  }

  .download-ad-dialog .download-ad-close-icon {
    border: 1pt solid currentColor;
    border-radius: 0.25rem;
    padding: 0.1rem 0.45rem;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    line-height: 1;
    font-size: 1.25rem;
  }

  .download-ad-dialog .download-ad-close {
    border: 1pt solid currentColor;
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
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

const xPixelSnippets = {
  body: html`\
<!-- X conversion tracking base code -->
<script>
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config','ov0j6');
</script>
<!-- End X conversion tracking base code -->
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
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}"
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
  ${<ClientScript async />}
  ${<Style>{rootStyle}</Style>}
  <link rel="alternate" type="application/rss+xml" title="www.nahcnuj.work" href="/feed.xml">
  ${import.meta.env.PROD && gtagSnippets.head}\
  ${(import.meta.env.PROD || props.downloadAdPopup) && adsenseSnippet}\
  ${
    props.useMath &&
    html`\
  <link rel="preload" href="https://mathfonts.github.io/LatinModern/latinmodern-math.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="https://mathfonts.github.io/LatinModern/mathfonts.css">
  <style>
    math{font-family:Latin Modern Math,serif}
    math[display=block]{max-width:100%;margin-block:1rem;overflow-x:auto;scrollbar-width:thin}
    .tml-left{text-align:left}
  </style>
`
  }\
  ${props.headInjection}\
</head>
<body>
  ${props.children}
  ${import.meta.env.PROD ? gtagSnippets.body : html`<!-- -->\n`}\
  ${import.meta.env.PROD && props.downloadAdPopup ? xPixelSnippets.body : html`<!-- -->\n`}\
</body>
</html>
`

export default Layout
