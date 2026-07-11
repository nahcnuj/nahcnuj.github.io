import fs from 'node:fs'
import path from 'node:path'
import { renderToReadableStream } from 'hono/jsx/dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RelatedArticles, { RELATED_PR_AD, mixRelatedPrAd } from '../app/components/RelatedArticles'

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

describe('mixRelatedPrAd', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('inserts the PR ad at a random index among articles', () => {
    // Math.random() === 0 → index 0
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const articles = [
      { path: '/a', title: 'A' },
      { path: '/b', title: 'B' },
    ]
    expect(mixRelatedPrAd(articles).map((a) => a.path)).toEqual([RELATED_PR_AD.path, '/a', '/b'])
  })

  it('can insert the PR ad at the end', () => {
    // index = floor(0.999 * 3) = 2
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    const articles = [
      { path: '/a', title: 'A' },
      { path: '/b', title: 'B' },
    ]
    expect(mixRelatedPrAd(articles).map((a) => a.path)).toEqual(['/a', '/b', RELATED_PR_AD.path])
  })

  it('does not mutate the original array', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const original = [{ path: '/a', title: 'A' }]
    mixRelatedPrAd(original)
    expect(original).toEqual([{ path: '/a', title: 'A' }])
  })
})

describe('RelatedArticles', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('displays articles in the given order with a PR ad mixed in', async () => {
    // PR at the end
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    const articles = [
      { path: '/z-last', title: 'Z Last' },
      { path: '/a-first', title: 'A First' },
      { path: '/m-middle', title: 'M Middle' },
    ]
    const node = RelatedArticles({ articles })
    const stream = await renderToReadableStream(node)
    const html = await new Response(stream).text()
    const hrefs = Array.from(html.matchAll(/href="([^"]+)"/g)).map((m) => m[1])
    expect(hrefs).toEqual(['/z-last', '/a-first', '/m-middle', RELATED_PR_AD.path])
  })

  it('displays all provided articles plus one PR ad', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const node = RelatedArticles({ articles: FIXTURE_ARTICLES })
    const stream = await renderToReadableStream(node)
    const html = await new Response(stream).text()
    const hrefs = Array.from(html.matchAll(/href="([^"]+)"/g)).map((m) => m[1])
    expect(hrefs).toHaveLength(FIXTURE_ARTICLES.length + 1)
    expect(hrefs).toContain(RELATED_PR_AD.path)
  })

  it('marks the PR ad as an external sponsored link', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const node = RelatedArticles({ articles: [{ path: '/a', title: 'A' }] })
    const stream = await renderToReadableStream(node)
    const html = await new Response(stream).text()
    expect(html).toContain(`href="${RELATED_PR_AD.path}"`)
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer sponsored"')
    expect(html).toContain(RELATED_PR_AD.title)
  })

  it('returns null when no articles', () => {
    const res = RelatedArticles({ articles: [] })
    expect(res).toBeNull()
  })
})
