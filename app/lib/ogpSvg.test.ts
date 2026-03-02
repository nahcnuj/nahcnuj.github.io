import { describe, expect, it } from 'vitest'
import { SITE_URL } from './site'
import { allOgpPaths, ogpSvg } from './ogpSvg'

const SITE_NAME = new URL(SITE_URL).host

describe('ogpSvg', () => {
  it('returns a string starting with <svg', () => {
    const svg = ogpSvg('index.svg')
    expect(svg).toMatch(/^<svg /)
  })

  it('produces an SVG with width=1200 and height=630', () => {
    const svg = ogpSvg('index.svg')
    expect(svg).toContain('width="1200"')
    expect(svg).toContain('height="630"')
  })

  it('includes parts of the title for a known static path', () => {
    const svg = ogpSvg('index.svg')
    // Title is split into two lines: Japanese name and English name in parens
    expect(svg).toContain('林 純一')
    expect(svg).toContain('(Junichi Hayashi)')
  })

  it('includes the site name label', () => {
    const svg = ogpSvg('index.svg')
    expect(svg).toContain(SITE_NAME)
  })

  it('falls back to the site name for an unknown path', () => {
    const svg = ogpSvg('nonexistent-page.svg')
    expect(svg).toContain(SITE_NAME)
  })

  it('includes the title for diary/index.svg', () => {
    const svg = ogpSvg('diary/index.svg')
    expect(svg).toContain('Diary')
  })

  it('uses Noto Sans CJK JP as the first font-family', () => {
    const svg = ogpSvg('index.svg')
    expect(svg).toContain("font-family=\"'Noto Sans CJK JP'")
  })
})

describe('allOgpPaths', () => {
  it('is a non-empty array', () => {
    expect(allOgpPaths.length).toBeGreaterThan(0)
  })

  it('contains the known static paths', () => {
    expect(allOgpPaths).toContain('index')
    expect(allOgpPaths).toContain('diary/index')
    expect(allOgpPaths).toContain('works/index')
    expect(allOgpPaths).toContain('essays/index')
  })
})
