import { describe, expect, it } from 'vitest'
import type { ArticleFrontmatter } from './articles'
import { createArticleList, createFeedItems, normalizePublished } from './articles'

// helper to cast loose test data to the expected parameter type
function asFiles(raw: Record<string, { frontmatter: unknown }>) {
  return raw as unknown as Record<string, { frontmatter: ArticleFrontmatter }>
}

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

describe('createArticleList', () => {
  const fakeFiles = {
    '../routes/diary/2026-01-01.mdx': { frontmatter: { title: 'A', published: '2026-01-01' } },
    '../routes/diary/2026-03-01.mdx': { frontmatter: { title: 'C', published: '2026-03-01' } },
    '../routes/diary/2026-02-01.mdx': { frontmatter: { title: 'B', published: '2026-02-01' } },
    // fixture entry — should be included
    '../fixtures/diary/fixture.mdx': { frontmatter: { title: 'F', published: '2025-06-01' } },
    // different directory — should be excluded
    '../routes/works/w.mdx': { frontmatter: { title: 'W', published: '2026-01-01' } },
  }

  it('includes fixture directory entries', () => {
    const list = createArticleList('diary', asFiles(fakeFiles))
    expect(list.map((item) => item.title)).toContain('F')
  })

  it('excludes entries from other directories', () => {
    const list = createArticleList('diary', asFiles(fakeFiles))
    expect(list.map((item) => item.title)).not.toContain('W')
  })

  it('transforms file paths to route paths', () => {
    const list = createArticleList('diary', asFiles(fakeFiles))
    expect(list.map((item) => item.path)).toContain('/diary/2026-01-01')
  })

  it('sorts results by path ascending', () => {
    const list = createArticleList('diary', asFiles(fakeFiles))
    const paths = list.map((item) => item.path)
    expect(paths).toEqual([...paths].sort((a, b) => a.localeCompare(b)))
  })
})

describe('createFeedItems', () => {
  const fakeFiles = {
    '../routes/diary/2026-01-01.mdx': { frontmatter: { title: 'A', published: '2026-01-01', description: 'desc A' } },
    '../routes/diary/2025-12-31.mdx': { frontmatter: { title: 'D', published: '2025-12-31' } },
    // fixtures directory — should be excluded from feed
    '../fixtures/diary/fixture.mdx': { frontmatter: { title: 'E', published: '2026-02-01' } },
    // different directory — should be excluded
    '../routes/works/w.mdx': { frontmatter: { title: 'X', published: '2020-01-01' } },
  }

  it('returns items sorted newest first', () => {
    const items = createFeedItems('diary', asFiles(fakeFiles))
    expect(items.map((i) => i.title)).toEqual(['A', 'D'])
  })

  it('includes published and optional description', () => {
    const items = createFeedItems('diary', asFiles(fakeFiles))
    expect(items[0].published).toBe('2026-01-01')
    expect(items[0].description).toBe('desc A')
    expect(items[1].published).toBe('2025-12-31')
    expect(items[1].description).toBeUndefined()
  })

  it('transforms file paths to route paths', () => {
    const items = createFeedItems('diary', asFiles(fakeFiles))
    expect(items.map((i) => i.path)).toContain('/diary/2026-01-01')
  })

  it('excludes fixtures directory entries', () => {
    const items = createFeedItems('diary', asFiles(fakeFiles))
    expect(items.map((i) => i.title)).not.toContain('E')
  })

  it('excludes entries from other directories', () => {
    const items = createFeedItems('diary', asFiles(fakeFiles))
    expect(items.map((i) => i.title)).not.toContain('X')
  })
})
