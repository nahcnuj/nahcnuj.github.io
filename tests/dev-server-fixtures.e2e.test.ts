/**
 * E2E test: verify that `npm run dev` serves fixture MDX files as pages.
 *
 * The `devFixturesPlugin` in vite.config.ts copies files from `app/fixtures/`
 * to `app/routes/` when the dev server starts.  These tests confirm that the
 * copied routes are reachable via HTTP and return non-404 responses with the
 * expected article content.
 */
import { type ViteDevServer, createServer } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('dev server: fixture MDX files are served as pages', () => {
  let server: ViteDevServer
  let baseUrl: string

  beforeAll(async () => {
    server = await createServer({
      server: { port: 0 },
    })
    await server.listen()
    const addr = server.httpServer?.address()
    const port = typeof addr === 'object' && addr !== null ? addr.port : 5173
    baseUrl = `http://localhost:${port}`
  }, 60_000)

  afterAll(async () => {
    await server.close()
  })

  it('serves fixture diary page (HTTP 200)', async () => {
    const res = await fetch(`${baseUrl}/diary/2026-02-09`, { redirect: 'follow' })
    expect(res.status).toBe(200)
  })

  it('fixture diary page HTML contains expected title', async () => {
    const res = await fetch(`${baseUrl}/diary/2026-02-09`, { redirect: 'follow' })
    const html = await res.text()
    expect(html).toContain('Fixture Diary: Dev Check')
  })

  it('serves fixture essay page (HTTP 200)', async () => {
    const res = await fetch(`${baseUrl}/essays/fixture-essay`, { redirect: 'follow' })
    expect(res.status).toBe(200)
  })

  it('fixture essay page HTML contains expected title', async () => {
    const res = await fetch(`${baseUrl}/essays/fixture-essay`, { redirect: 'follow' })
    const html = await res.text()
    expect(html).toContain('Fixture Essay: Dev Check')
  })
})
