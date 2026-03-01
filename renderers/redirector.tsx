import type { Context } from 'hono'

export function redirectTo(newUrl: string) {
  return (c: Context) =>
    c.html(
      <html lang="ja">
        <head>
          <meta charset="utf-8" />
          <meta http-equiv="refresh" content={`0;url=${newUrl}`} />
          <link rel="canonical" href={newUrl} />
        </head>
        <body>
          <h1>
            This page has been moved to <a href={newUrl}>{newUrl}</a>.
          </h1>
        </body>
      </html>,
    )
}
