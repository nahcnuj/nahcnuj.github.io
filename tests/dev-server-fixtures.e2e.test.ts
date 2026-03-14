/**
 * E2E test: verify that `npm run dev` serves all fixture MDX files as pages.
 *
 * The `devFixturesPlugin` in vite.config.ts copies files from `app/fixtures/`
 * to `app/routes/` when the dev server starts.  These tests confirm that every
 * MDX file discovered under `app/fixtures/` is reachable via HTTP (HTTP 200)
 * when the dev server is running.
 */
import fs from 'node:fs'
import path from 'node:path'
import { type ViteDevServer, createServer } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/** Recursively collect all *.mdx files under a directory. */
function collectMdxFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...collectMdxFiles(full))
    else if (entry.isFile() && entry.name.endsWith('.mdx')) results.push(full)
  }
  return results
}

/** Derive the route path for a fixture MDX file.
 *  e.g. app/fixtures/diary/2026-02-09.mdx → /diary/2026-02-09
 */
function fixtureToRoutePath(fixturesDir: string, filePath: string): string {
  const rel = path.relative(fixturesDir, filePath)
  return `/${rel.replace(/\.mdx$/, '').split(path.sep).join('/')}`
}

const fixturesDir = path.resolve(process.cwd(), 'app/fixtures')
const fixtureFiles = collectMdxFiles(fixturesDir)
const fixtureRoutes = fixtureFiles.map((f) => fixtureToRoutePath(fixturesDir, f))

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

  it('discovers at least one fixture MDX file', () => {
    expect(fixtureFiles.length).toBeGreaterThan(0)
  })

  for (const route of fixtureRoutes) {
    it(`serves ${route} (HTTP 200)`, async () => {
      const res = await fetch(`${baseUrl}${route}`, { redirect: 'follow' })
      expect(res.status).toBe(200)
    })
  }
})
