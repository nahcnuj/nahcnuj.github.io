/// <reference types="vite/client" />

import { type Context, Hono } from 'hono'
import { redirectTo } from '../../../renderers'
import { articlesByDirectory } from '../../lib/articles'
import MakamujoBanner from '../../components/MakamujoBanner'
import DiaryList from '../../islands/DiaryList'

const app = new Hono()

app.get('/index.html', (c: Context) => {
  const title = `Junichi Hayashi's Diary`
  const description = 'There is the diary Junichi Hayashi wrote.'

  const diaries = articlesByDirectory.diary.map(({ path, title, description }) => [path, { title, description }] as const)

  return c.render(
    <>
      <h1>日記</h1>
      <MakamujoBanner />
      <DiaryList diaries={diaries} />
    </>,
    { frontmatter: { title, description, published: '2020-01-01' } },
  )
})

app.get('/2020-07-04', redirectTo('https://www.nahcnuj.work/diary/2020/07/04.html'))
app.get('/2020-07-20', redirectTo('https://www.nahcnuj.work/diary/2020/07/20.html'))

app.get('/2025/02/08.html', redirectTo('https://www.nahcnuj.work/essays/feel/2025/02/08.html'))

export default app
