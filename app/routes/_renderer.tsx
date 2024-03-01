import { Style, css } from 'hono/css'
import { jsxRenderer } from 'hono/jsx-renderer'
import { Script } from 'honox/server'

export default jsxRenderer(({ children, title, description }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ?? ''}</title>
        {description && <meta name="description" content={description} />}
        {title && <meta property="og:title" content={title} />}
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://img.nahcnuj.work/author.jpg" />
        <meta property="og:image:alt" content="Junichi's face" />
        <Script src="/app/client.ts" async />
        <Style>{css`
          html, body { margin: 0; padding: 0; }
          body > * { margin-inline: auto; max-width: 40em; font-size: 1.2em; }
        `}</Style>
      </head>
      <body>
        {children}
        <footer>
          <p>&copy; Junichi Hayashi</p>
        </footer>
      </body>
    </html>
  )
})
