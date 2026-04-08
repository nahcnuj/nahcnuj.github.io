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

  it('shows all articles when maxItems is omitted', async () => {
    const node = RelatedArticles({ articles: FIXTURE_ARTICLES, currentPath: '/x' })
    const stream = await renderToReadableStream(node)
    const html = await new Response(stream).text()
    const hrefs = Array.from(html.matchAll(/href="([^"]+)"/g)).map((m) => m[1])
    expect(hrefs).toHaveLength(FIXTURE_ARTICLES.length)
  })

  describe('preserveOrder', () => {
    const orderedArticles = [
      { path: '/z-last', title: 'Z Last' },
      { path: '/a-first', title: 'A First' },
      { path: '/m-middle', title: 'M Middle' },
    ]

    it('preserves input order when preserveOrder is true', async () => {
      const node = RelatedArticles({ articles: orderedArticles, currentPath: '/x', preserveOrder: true })
      const stream = await renderToReadableStream(node)
      const html = await new Response(stream).text()
      const hrefs = Array.from(html.matchAll(/href="([^"]+)"/g)).map((m) => m[1])
      expect(hrefs).toEqual(['/z-last', '/a-first', '/m-middle'])
    })

    it('slices to maxItems while preserving order', async () => {
      const node = RelatedArticles({ articles: orderedArticles, currentPath: '/x', maxItems: 2, preserveOrder: true })
      const stream = await renderToReadableStream(node)
      const html = await new Response(stream).text()
      const hrefs = Array.from(html.matchAll(/href="([^"]+)"/g)).map((m) => m[1])
      expect(hrefs).toHaveLength(2)
      expect(hrefs).toEqual(['/z-last', '/a-first'])
    })

    it('excludes currentPath while preserving order of remaining articles', async () => {
      const node = RelatedArticles({ articles: orderedArticles, currentPath: '/a-first', preserveOrder: true })
      const stream = await renderToReadableStream(node)
      const html = await new Response(stream).text()
      const hrefs = Array.from(html.matchAll(/href="([^"]+)"/g)).map((m) => m[1])
      expect(hrefs).toEqual(['/z-last', '/m-middle'])
    })
  })
})
