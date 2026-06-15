import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import MathFixtureMdx, { frontmatter as mathFixtureFrontmatter } from '../fixtures/essays/math-markdown-syntax-fixture.mdx'
import { articleMdxRenderer } from './articleMdxRenderer'

// biome-ignore lint/suspicious/noExplicitAny: mock component for tests
function MockLayout({ children }: any) {
  return <html lang="ja"><body>{children}</body></html>
}

function makeMdxApp() {
  const app = new Hono()

  app.use('/*', (c, next) => {
    c.setLayout(MockLayout as never)
    return next()
  })

  app.use(articleMdxRenderer)

  // biome-ignore lint/suspicious/noExplicitAny: MDX component call and honox render API are loosely typed in tests
  app.get('/essays/math-markdown-syntax-fixture', (c) => (c.render as any)(MathFixtureMdx({}), { frontmatter: mathFixtureFrontmatter }))

  return app
}

describe('MDX math rendering', () => {
  it('renders $...$ and $$...$$ in MDX as KaTeX markup', async () => {
    const app = makeMdxApp()
    const res = await app.request('/essays/math-markdown-syntax-fixture')
    const text = await res.text()

    expect(res.status).toBe(200)
    // Both inline and display math should render with KaTeX class
    expect(text).toContain('class="katex')
    // Check that math annotations are present for both inline and display math
    expect(text).toContain('<annotation encoding="application/x-tex">E=mc^2</annotation>')
    expect(text).toContain('<annotation encoding="application/x-tex">\\int_0^1 x^2 \\, dx = \\frac{1}{3}</annotation>')
    // Display math should have katex-display class
    expect(text).toContain('class="katex katex-display"')
  })
})
