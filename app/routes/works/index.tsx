import { type Context, Hono } from 'hono'
import MakamujoBanner from '../../components/MakamujoBanner'
import WorkList from '../../components/WorkList'

interface Frontmatter {
  title: string
  description: string
  begins: number
  ends?: number
  thumbnail: `/${string}`
  published: string
}

const app = new Hono()

app.get('/index.html', (c: Context) => {
  const title = `Junichi Hayashi's Works`
  const description = 'There are the works Junichi Hayashi has made.'

  const works = ((files: Record<string, { frontmatter: Frontmatter }>) =>
    Object.entries(files)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([path, { frontmatter }]) => [path.slice(2).replace(/\.mdx$/, ''), frontmatter] as const))(
    import.meta.glob<{ frontmatter: Frontmatter }>('./**/*.mdx', {
      eager: true,
    }),
  )

  return c.render(
    <>
      <h1>Works</h1>
      <MakamujoBanner />
      <p>私が制作したモノの一覧です。</p>

      <WorkList works={works} />
    </>,
    { frontmatter: { title, description, published: '2020-01-01' } },
  )
})

export default app
