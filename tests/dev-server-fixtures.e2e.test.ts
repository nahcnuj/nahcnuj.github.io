/**
 * E2E test: verify that `npm run dev` serves all fixture MDX files as pages.
 *
 * The `devFixturesPlugin` in vite.config.ts copies files from `app/fixtures/`
 * to `app/routes/` when the dev server starts.  These tests confirm that every
 * MDX file discovered under `app/fixtures/` is reachable via HTTP (HTTP 200)
 * when the dev server is running.
 */
import { type ViteDevServer, createServer } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const fixtureModules = import.meta.glob('../app/fixtures/**/*.mdx')
const fixtureRoutes = Object.keys(fixtureModules).map((modulePath) =>
  modulePath.replace(/^\.\.\/app\/fixtures/, '').replace(/\.mdx$/, '')
)

describe('dev server (npm run dev): all fixture MDX files are routed correctly', () => {
  let server: ViteDevServer
  let baseUrl: string

  beforeAll(async () => {
    // createServer reads vite.config.ts automatically, mirroring `npm run dev`
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

  for (const route of fixtureRoutes) {
    it(`serves ${route} (HTTP 200)`, async () => {
      const res = await fetch(`${baseUrl}${route}`, { redirect: 'manual' })
      expect(res.status).toBe(200)
    })
  }
})
