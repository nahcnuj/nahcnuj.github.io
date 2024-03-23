import { Hono } from 'hono'
import type { H } from 'hono/types'
import DiaryList from '../../islands/DiaryList'
import type { Meta } from './type'

const diaries = ((files) =>
  Object.entries(files).map(
    ([path, ...tail]) => [path.replace(/^\/src\/diary/, '.').replace(/\.mdx$/, '.html'), ...tail] as const,
  ))(
  import.meta.glob<{ frontmatter: Meta }>('./**/*.mdx', {
    eager: true,
  }),
)

const app = new Hono()

app.get('/', (c) => {
  const title = `Junichi Hayashi's Works`
  const description = 'There are the works Junichi Hayashi has made.'

  return c.render(
    <>
      <h1>日記</h1>
      <DiaryList diaries={diaries} />
    </>,
    { title, description },
  )
})

app.get('/2020-07-04', rendererToRedirectTo('https://www.nahcnuj.work/diary/2020/07/04.html'))
app.get('/2020-07-20', rendererToRedirectTo('https://www.nahcnuj.work/diary/2020/07/20.html'))

export default app

function rendererToRedirectTo(newUrl: string): H {
  return (c) =>
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
