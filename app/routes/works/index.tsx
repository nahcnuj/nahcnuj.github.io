import { Hono } from 'hono'
import WorkList from '../../components/WorkList'
import type { Meta } from './type'

const app = new Hono()

app.get(
  '/index', // for compatibility, generates as /works/index.html
  (c) => {
    const title = `Junichi Hayashi's Works`
    const description = 'There are the works Junichi Hayashi has made.'

    const works = import.meta.glob<{ frontmatter: Meta }>('./**/*.mdx', {
      eager: true,
    })

    return c.render(
      <>
        <h1>Works</h1>
        <p>私が制作したモノの一覧です。</p>

        <WorkList
          works={Object.entries(works)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([filename, { frontmatter }]) => [filename.replace(/\.mdx$/, '.html'), frontmatter])}
        />
      </>,
      { title, description },
    )
  },
)

export default app
