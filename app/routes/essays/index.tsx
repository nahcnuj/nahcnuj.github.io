import { type Context, Hono } from 'hono'
import { hasValidPublished } from '../../components/Article'
import EssayList from '../../islands/EssayList'

interface Frontmatter {
  title: string
  description?: string
  published: string
}

const app = new Hono()

app.get('/index.html', (c: Context) => {
  const title = `Junichi Hayashi's Essays`
  const description = 'There are essays about something by Junichi Hayashi.'

  const essays = ((files: Record<string, { frontmatter: Frontmatter }>) =>
    Object.entries(files)
      .filter(([, { frontmatter }]) => hasValidPublished(frontmatter))
      .map(([path, { frontmatter }]) => [path.replace(/\.mdx$/, ''), frontmatter] as const))(
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
