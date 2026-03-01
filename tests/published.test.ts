import { describe, expect, it } from 'vitest'
import type { ArticleFrontmatter } from '../app/lib/articles'
import { createArticleList, createFeedItems, hasValidPublished, normalizePublished } from '../app/lib/articles'

describe('normalizePublished', () => {
  it('returns date portion for YYYY-MM-DD', () => {
    expect(normalizePublished('2026-02-26')).toBe('2026-02-26')
  })

  it('accepts ISO strings with time or timezone', () => {
    expect(normalizePublished('2026-02-26T15:30:00Z')).toBe('2026-02-26')
    expect(normalizePublished('2026-02-26T23:59:59+09:00')).toBe('2026-02-26')
  })

  it('returns undefined for invalid values', () => {
    expect(normalizePublished(undefined)).toBeUndefined()
    expect(normalizePublished('not a date')).toBeUndefined()
    expect(normalizePublished(12345)).toBeUndefined()
  })
})

describe('createArticleList filtering', () => {
  // loose type allowing arbitrary published values for testing
  const fakeFiles: Record<string, { frontmatter: unknown }> = {
    '../routes/diary/a.mdx': { frontmatter: { title: 'A', published: '2026-01-01' } },
    '../routes/diary/b.mdx': { frontmatter: { title: 'B' } },
    '../routes/diary/c.mdx': { frontmatter: { title: 'C', published: 'invalid' } },
    '../routes/diary/d.mdx': { frontmatter: { title: 'D', published: '2025-12-31T23:00:00Z' } },
    // a file in a different directory should be ignored entirely
    '../routes/works/x.mdx': { frontmatter: { title: 'X', published: '2020-01-01' } },
  }

  it('drops entries without or with bad published', () => {
    // `createArticleList` expects `ArticleFrontmatter`, so cast for our
    // synthetic data.
    const list = createArticleList('diary', fakeFiles as unknown as Record<string, { frontmatter: ArticleFrontmatter }>)
    // only A and D should survive, sorted by path
    expect(list.map((item) => item.title)).toEqual(['A', 'D'])
  })
})

describe('hasValidPublished helper', () => {
  it('reports false when frontmatter lacks published or is invalid', () => {
    expect(hasValidPublished({})).toBe(false)
    expect(hasValidPublished({ published: 'not a date' })).toBe(false)
    expect(hasValidPublished({ published: '2026-01-01' })).toBe(true)
  })
})

describe('createFeedItems', () => {
  const fakeFiles: Record<string, { frontmatter: unknown }> = {
    '../routes/diary/a.mdx': { frontmatter: { title: 'A', published: '2026-01-01', description: 'desc A' } },
    '../routes/diary/b.mdx': { frontmatter: { title: 'B' } },
    '../routes/diary/c.mdx': { frontmatter: { title: 'C', published: 'invalid' } },
    '../routes/diary/d.mdx': { frontmatter: { title: 'D', published: '2025-12-31T23:00:00Z' } },
    // fixtures directory entries should be excluded
    '../fixtures/diary/e.mdx': { frontmatter: { title: 'E', published: '2026-02-01' } },
    // a file in a different directory should be ignored
    '../routes/works/x.mdx': { frontmatter: { title: 'X', published: '2020-01-01' } },
  }

  it('returns items with published and description, sorted newest first', () => {
    const items = createFeedItems('diary', fakeFiles as unknown as Record<string, { frontmatter: ArticleFrontmatter }>)
    expect(items.map((i) => i.title)).toEqual(['A', 'D'])
    expect(items[0].published).toBe('2026-01-01')
    expect(items[0].description).toBe('desc A')
    expect(items[1].published).toBe('2025-12-31')
    expect(items[1].description).toBeUndefined()
  })

  it('excludes fixtures directory entries', () => {
    const items = createFeedItems('diary', fakeFiles as unknown as Record<string, { frontmatter: ArticleFrontmatter }>)
    expect(items.map((i) => i.title)).not.toContain('E')
  })
})
