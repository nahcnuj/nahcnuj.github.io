import { Hono } from 'hono'
import WorkList from '../../components/WorkList'

const app = new Hono()

app.get('/index.html', (c) => {
  const title = `Junichi Hayashi's Works`
  const description = 'There are the works Junichi Hayashi has made.'

  const works = ((files) =>
    Object.entries(files)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([path, ...tail]) => [path.replace(/\.mdx$/, ''), ...tail] as const))(
    import.meta.glob<{ frontmatter: unknown }>('./**/*.mdx', {
      eager: true,
    }),
  )

  return c.render(
    <>
      <h1>Works</h1>
      <p>私が制作したモノの一覧です。</p>

      <WorkList works={works} />
    </>,
    { title, description },
  )
})

export default app
