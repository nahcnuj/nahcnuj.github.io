import { Hono } from 'hono'
import EssayList from '../../islands/EssayList'
import type { Meta } from './type'

const app = new Hono()

app.get('/index.html', (c) => {
  const title = `Junichi Hayashi's Essays`
  const description = 'There are essays about something by Junichi Hayashi.'

  const essays = ((files) =>
    Object.entries(files).map(([path, ...tail]) => [path.replace(/\.mdx$/, ''), ...tail] as const))(
    import.meta.glob<{ frontmatter: Meta }>('./**/*.mdx', {
      eager: true,
    }),
  )

  return c.render(
    <>
      <h1>エッセイ</h1>
      <p>何かしらに言及したくなったときに取り留めもないままに書き連ねます。</p>
      <EssayList essays={essays} />
    </>,
    { title, description },
  )
})

export default app
