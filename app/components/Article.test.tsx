import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer'
import { describe, expect, it } from 'vitest'
import Article from './Article'

function makeAppWithArticle(children: unknown) {
  const app = new Hono()
  app.use(
    '/*',
    jsxRenderer(({ children }) => {
      return <html lang="ja"><body>{children}</body></html>
    }),
  )

  // biome-ignore lint/suspicious/noExplicitAny: test helper uses framework render API directly
  app.get('/*', (c) => (c.render as any)(<Article currentPath="/essays/math-test">{children}</Article>))
  return app
}

describe('Article', () => {
  it('converts inline and display math delimiters to KaTeX markup', async () => {
    const app = makeAppWithArticle(
      <>
        <p>Inline math: $a^2+b^2=c^2$</p>
        <p>$$\\int_0^1 x^2 dx$$</p>
      </>,
    )

    const res = await app.request('/essays/math-test')
    const text = await res.text()

    expect(res.status).toBe(200)
    expect(text).toContain('class="katex"')
    expect(text).toContain('class="katex-display"')
  })

  it('does not rewrite math delimiters inside code blocks', async () => {
    const app = makeAppWithArticle(
      <pre>
        <code>$not_converted$</code>
      </pre>,
    )

    const res = await app.request('/essays/math-test')
    const text = await res.text()

    expect(res.status).toBe(200)
    expect(text).toContain('<code>$not_converted$</code>')
    expect(text).not.toContain('not_converted</annotation>')
  })
})
