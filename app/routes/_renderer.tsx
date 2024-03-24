import { Style, css } from 'hono/css'
import { raw } from 'hono/html'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Script } from 'honox/server'
import Article from '../components/Article'
import RootFooter from '../components/RootFooter'
import RootHeader from '../components/RootHeader'

const rootStyle = css`
  html, body { margin: 0; padding: 0; }

  :root {
    --theme-base-color: #e6e6ff;
    --theme-main-color: #000033;
    --theme-accent-color: #ff6666;
  }

  html {
    background: var(--theme-base-color);
    color: var(--theme-main-color);
    font-size: 1.2em;

    scrollbar-gutter: stable both-edges;
  }

  a:visited {
    color: var(--theme-main-color);
  }
  a:active, a:hover {
    color: var(--theme-accent-color);
  }
`

const containerClass = css`
  max-width: 40rem;
  margin-inline: auto;
`

export default jsxRenderer(({ children, ...props }) => {
  const navItems = [
    { title: 'Index', href: '/' as const },
    { title: 'Diary', href: '/diary/index.html' as const },
    { title: 'Works', href: '/works/index.html' as const },
  ]

  const title = props.title ?? props.frontmatter?.title
  const description = props.description ?? props.frontmatter?.description
  const thumbnail = props.thumbnail ?? props.frontmatter?.thumbnail

  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ?? 'Untitled'}</title>
        {description && <meta name="description" content={description} />}
        {title && <meta property="og:title" content={title} />}
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        {thumbnail ? (
          <>
            <meta
              property="og:image"
              content={thumbnail.startsWith('http') ? thumbnail : `https://img.nahcnuj.work${thumbnail}`}
            />
          </>
        ) : (
          <>
            <meta property="og:image" content="https://img.nahcnuj.work/author.jpg" />
            <meta property="og:image:alt" content="Junichi's face" />
          </>
        )}
        <Script src="/app/client.ts" async />
        <Style>{rootStyle}</Style>
        <script src="https://www.googletagmanager.com/gtag/js?id=G-RMH8Q8RB96" async />
        <script>{raw`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-RMH8Q8RB96');
        `}</script>
      </head>
      <body>
        <div class={containerClass}>
          <RootHeader navItems={navItems} />
          <Article>{children}</Article>
          <RootFooter />
        </div>
      </body>
    </html>
  )
})
