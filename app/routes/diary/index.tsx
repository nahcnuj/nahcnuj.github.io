/// <reference types="vite/client" />

import { type Context, Hono } from 'hono'
import { redirectTo } from '../../../renderers'
import { hasValidPublished } from '../../components/Article'
import DiaryList from '../../islands/DiaryList'

interface Frontmatter {
  title: string
  description?: string
  published: string
}

const app = new Hono()

app.get('/index.html', (c: Context) => {
  const title = `Junichi Hayashi's Diary`
  const description = 'There is the diary Junichi Hayashi wrote.'

  const diaries = ((files: Record<string, { frontmatter: Frontmatter }>) =>
    Object.entries(files)
      // filter out unpublished/invalid items
      .filter(([, { frontmatter }]) => hasValidPublished(frontmatter))
      .map(([path, { frontmatter }]) => [path.replace(/\.mdx$/, ''), frontmatter] as const))(
    import.meta.glob<{ frontmatter: Frontmatter }>('./**/*.mdx', {
      eager: true,
    }),
  )

  return c.render(
    <>
      <h1>日記</h1>
      <DiaryList diaries={diaries} />
    </>,
    { frontmatter: { title, description, published: '2020-01-01' } },
  )
})

app.get('/2020-07-04', redirectTo('https://www.nahcnuj.work/diary/2020/07/04.html'))
app.get('/2020-07-20', redirectTo('https://www.nahcnuj.work/diary/2020/07/20.html'))

app.get('/2025/02/08.html', redirectTo('https://www.nahcnuj.work/essays/feel/2025/02/08.html'))

export default app
