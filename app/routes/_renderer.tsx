import { Style, css } from 'hono/css'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Script } from 'honox/server'
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
  }

  a:active {
    color: var(--theme-accent-color);
  }
  a:visited {
    color: var(--theme-main-color);
  }
`

const containerClass = css`
  max-width: 40rem;
  margin-inline: auto;
`

export default jsxRenderer(({ children, title, description }) => {
  const navItems = [
    { title: 'Index', href: '/' as const },
    { title: 'Works', href: '/works/index.html' as const },
  ]

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
        <meta property="og:image" content="https://img.nahcnuj.work/author.jpg" />
        <meta property="og:image:alt" content="Junichi's face" />
        <Script src="/app/client.ts" async />
        <Style>{rootStyle}</Style>
      </head>
      <body>
        <div class={containerClass}>
          <RootHeader navItems={navItems} />
          {children}
          <RootFooter />
        </div>
      </body>
    </html>
  )
})
