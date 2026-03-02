import { describe, expect, it } from 'vitest'
import { SITE_URL } from './site'
import { allOgpPaths, ogpSvg } from './ogpSvg'
import { svg2png } from './svg2png'

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

  it('contains no paths ending with .html (og:image strips .html, so OGP paths must match)', () => {
    for (const p of allOgpPaths) {
      expect(p).not.toMatch(/\.html$/)
    }
  })
})

// Regression tests: prevent recurrence of #584 (title truncation) and #586/#588 (Japanese font rendering)
describe('OGP pipeline integration (ogpSvg + svg2png)', () => {
  it('index OGP SVG title is split into two separate <text> elements (not truncated)', () => {
    // Regression for #584: title was rendered as "Hayashi)" because the STATIC_TITLES entry
    // lacked a \n separator, causing wrapLines to split at the wrong position.
    const svg = ogpSvg('index.svg')
    const textElements = [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((m) => m[1])
    expect(textElements).toContain('林 純一')
    expect(textElements).toContain('(Junichi Hayashi)')
    // The two parts must be in separate elements (not merged on one line)
    const combined = textElements.find((t) => t.includes('林 純一') && t.includes('Hayashi'))
    expect(combined).toBeUndefined()
  })

  it('index OGP PNG renders Japanese title line (requires fonts-noto-cjk)', () => {
    // Regression for #586/#588: Japanese fonts were not installed in the deployment workflow,
    // causing @resvg/resvg-js to silently drop CJK glyphs and produce blank text in OGP PNGs.
    // This test fails if fonts-noto-cjk is not installed, catching the missing-font regression.
    //
    // Comparing against the no-text version is insufficient because ASCII text (e.g. "(Junichi
    // Hayashi)") renders even without CJK fonts, making the PNG larger regardless.
    // Instead, compare the full OGP PNG against a version with only the Japanese title line
    // removed; any size difference is caused solely by CJK glyph rendering.
    const svg = ogpSvg('index.svg')
    const svgWithoutJapaneseLine = svg.replace(/<text[^>]*>林 純一<\/text>/, '')
    const pngWithJapanese = svg2png(svg)
    const pngWithoutJapanese = svg2png(svgWithoutJapaneseLine)
    // When Noto Sans CJK JP is installed, '林 純一' renders as visible pixels, making the PNG larger.
    // If the font is absent and glyphs are silently dropped, both PNGs are identical in size.
    // The difference is in the thousands of bytes (empirically ~3 KB), well above noise.
    expect(pngWithJapanese.length).toBeGreaterThan(pngWithoutJapanese.length)
  })
})
