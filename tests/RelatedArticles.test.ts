import fs from 'node:fs'
import path from 'node:path'
import { renderToReadableStream } from 'hono/jsx/dom/server'
import { describe, expect, it } from 'vitest'
import RelatedArticles from '../app/components/RelatedArticles'

// Load articles from app/fixtures/**/*.mdx
function loadFixtureArticles() {
  const base = path.resolve(process.cwd(), 'app/fixtures')
  const files: string[] = []
  function walk(dir: string) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      const st = fs.statSync(full)
      if (st.isDirectory()) walk(full)
      else if (st.isFile() && full.endsWith('.mdx')) files.push(full)
    }
  }
  walk(base)
  const articles = files
    .map((file) => {
      const rel = path.relative(base, file)
      const parts = rel.split(path.sep)
      const dir = parts[0]
      const name = path.basename(file, '.mdx')
      const routePath = `/${dir}/${name}`
      const content = fs.readFileSync(file, 'utf8')
      const fm = content.match(/---\s*([\s\S]*?)\s*---/)
      let title = name
      let published: string | undefined
      if (fm) {
        const m = fm[1].match(/title:\s*["']?([\s\S]*?)["']?\s*$/m)
        if (m) title = m[1]
        const m2 = fm[1].match(/published:\s*["']?([^"\n']+)["']?/)
        if (m2) published = m2[1]
      }
      // mimic new validation: skip if no published
      if (!published) return null
      return { path: routePath, title }
    })
    .filter((a): a is { path: string; title: string } => a !== null)
  return articles
}

const FIXTURE_ARTICLES = loadFixtureArticles()

describe('RelatedArticles', () => {
  it('selects random items then displays them sorted by path', async () => {
    const node = RelatedArticles({ articles: FIXTURE_ARTICLES, currentPath: '/x', maxItems: 2 })
    // Render to HTML string using Hono server readable stream
    const stream = await renderToReadableStream(node)
    const html = await new Response(stream).text()

    const hrefs = Array.from(html.matchAll(/href="([^"]+)"/g)).map((m) => m[1])

    // should have maxItems links
    expect(hrefs).toHaveLength(2)

    // selected items must be subset of fixture paths
    const fixturePaths = FIXTURE_ARTICLES.map((a) => a.path)
    expect(hrefs.every((h) => fixturePaths.includes(h))).toBe(true)

    // displayed order must be lexicographic by path
    const sorted = [...hrefs].sort((a, b) => a.localeCompare(b))
    expect(hrefs).toEqual(sorted)
  })

  it('excludes currentPath', async () => {
    const node = RelatedArticles({ articles: FIXTURE_ARTICLES, currentPath: '/diary/2026-02-09', maxItems: 3 })
    const stream = await renderToReadableStream(node)
    const html = await new Response(stream).text()
    expect(html).not.toContain('href="/diary/2026-02-09"')
  })

  it('returns null when no related articles', () => {
    const only = [{ path: '/single', title: 'Single' }]
    const res = RelatedArticles({ articles: only, currentPath: '/single' })
    expect(res).toBeNull()
  })
})
