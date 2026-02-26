import { describe, expect, it } from 'vitest'
import { createArticleList, hasValidPublished, normalizePublished } from '../app/components/Article'

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
  // use a loose `any` type so we can simulate missing `published` values
  const fakeFiles: Record<string, { frontmatter: any }> = {
    '../routes/diary/a.mdx': { frontmatter: { title: 'A', published: '2026-01-01' } },
    '../routes/diary/b.mdx': { frontmatter: { title: 'B' } },
    '../routes/diary/c.mdx': { frontmatter: { title: 'C', published: 'invalid' } },
    '../routes/diary/d.mdx': { frontmatter: { title: 'D', published: '2025-12-31T23:00:00Z' } },
    // a file in a different directory should be ignored entirely
    '../routes/works/x.mdx': { frontmatter: { title: 'X', published: '2020-01-01' } },
  }

  it('drops entries without or with bad published', () => {
    const list = createArticleList('diary', fakeFiles)
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
