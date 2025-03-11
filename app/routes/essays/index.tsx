import { Hono } from 'hono'
import EssayList from '../../islands/EssayList'

interface Frontmatter {
  title: string
  description?: string
}

const app = new Hono()

app.get('/index.html', (c) => {
  const title = `Junichi Hayashi's Essays`
  const description = 'There are essays about something by Junichi Hayashi.'

  const essays = ((files) =>
    Object.entries(files).map(([path, { frontmatter }]) => [path.replace(/\.mdx$/, ''), frontmatter] as const))(
    import.meta.glob<{ frontmatter: Frontmatter }>('./**/*.mdx', {
      eager: true,
    }),
  )

  return c.render(
    <>
      <h1>エッセイ</h1>
      <p>何かしらに言及したくなったときに取り留めもないままに書き連ねます。</p>
      <EssayList essays={essays} />
    </>,
    { frontmatter: { title, description } },
  )
})

export default app
