import { Hono } from 'hono'
import type { H } from 'hono/types'
import DiaryList from '../../islands/DiaryList'

interface Frontmatter {
  title: string
  description?: string
}

const app = new Hono()

app.get('/index.html', (c) => {
  const title = `Junichi Hayashi's Diary`
  const description = 'There is the diary Junichi Hayashi wrote.'

  const diaries = ((files) =>
    Object.entries(files).map(([path, { frontmatter }]) => [path.replace(/\.mdx$/, ''), frontmatter] as const))(
    import.meta.glob<{ frontmatter: Frontmatter }>('./**/*.mdx', {
      eager: true,
    }),
  )

  return c.render(
    <>
      <h1>日記</h1>
      <DiaryList diaries={diaries} />
    </>,
    { frontmatter: { title, description } },
  )
})

app.get('/2020-07-04', rendererToRedirectTo('https://www.nahcnuj.work/diary/2020/07/04.html'))
app.get('/2020-07-20', rendererToRedirectTo('https://www.nahcnuj.work/diary/2020/07/20.html'))

app.get('/2025/02/08.html', rendererToRedirectTo('https://www.nahcnuj.work/essays/feel/2025/02/08.html'))

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
