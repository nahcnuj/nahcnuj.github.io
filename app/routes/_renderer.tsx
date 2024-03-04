import { Style, css } from 'hono/css'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Script } from 'honox/server'
import RootFooter from '../components/RootFooter'
import RootHeader from '../components/RootHeader'

const containerClass = css`
  margin-inline: auto;
  max-width: 40em;
  font-size: 1.2em;
`

export default jsxRenderer(({ children, title, description }) => {
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
        <Style>{css`
          html, body { margin: 0; padding: 0; }
        `}</Style>
      </head>
      <body>
        <div class={containerClass}>
          <RootHeader />
          {children}
          <RootFooter />
        </div>
      </body>
    </html>
  )
})
