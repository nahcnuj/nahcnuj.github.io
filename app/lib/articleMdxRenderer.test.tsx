import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { articleMdxRenderer } from './articleMdxRenderer'

// biome-ignore lint/suspicious/noExplicitAny: mock component for tests
type AnyProps = any

function MockLayout({ children }: AnyProps) {
  return <html lang="ja"><body>{children}</body></html>
}

function makeApp(frontmatter?: unknown) {
  const app = new Hono()
  // Set MockLayout before articleMdxRenderer so it becomes the outer Layout
  app.use('/*', (c, next) => {
    c.setLayout(MockLayout as never)
    return next()
  })
  app.use(articleMdxRenderer)
  // Pass frontmatter as the second argument to c.render, mirroring how honox passes it
  // biome-ignore lint/suspicious/noExplicitAny: honox passes frontmatter as render props
  app.get('/*', (c) => (c.render as any)('', frontmatter !== undefined ? { frontmatter } : undefined))
  return app
}

describe('articleMdxRenderer', () => {
  it('is a middleware function', () => {
    expect(typeof articleMdxRenderer).toBe('function')
  })

  // When frontmatter is absent or invalid, the renderer throws HTTPException(404)
  // so that the JSX serializer is bypassed and a clean 404 response is returned.
  it('returns 404 when frontmatter is missing', async () => {
    const res = await makeApp().request('/diary/test')
    expect(res.status).toBe(404)
  })

  it('returns 404 when published is absent', async () => {
    const res = await makeApp({ title: 'Test' }).request('/diary/test')
    expect(res.status).toBe(404)
  })

  it('returns 404 when published is invalid', async () => {
    const res = await makeApp({ title: 'Test', published: 'not-a-date' }).request('/diary/test')
    expect(res.status).toBe(404)
  })

  it('returns 200 for a valid article', async () => {
    const res = await makeApp({ title: 'Test', published: '2026-01-01' }).request('/diary/test-article')
    expect(res.status).toBe(200)
  })
})
