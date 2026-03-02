/**
 * Integration tests for the OGP SVG → PNG pipeline.
 *
 * These tests cover the full chain from ogpSvg() through svg2png() to verify
 * that OGP images render correctly in a production-like environment.
 *
 * Regression targets:
 *   #584 – Index page title was truncated ("Hayashi)" instead of "(Junichi Hayashi)")
 *   #586/#588 – Japanese text was silently dropped from OGP PNGs when fonts-noto-cjk was missing
 */
import { describe, expect, it } from 'vitest'
import { ogpSvg } from '../app/lib/ogpSvg'
import { svg2png } from '../app/lib/svg2png'

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
    // Sanity checks: ensure the Japanese line exists, and that it was removed by the replacement.
    expect(svg).toContain('林 純一')
    expect(svgWithoutJapaneseLine).not.toContain('林 純一')
    expect(svgWithoutJapaneseLine).not.toBe(svg)

    const pngWithJapanese = svg2png(svg)
    const pngWithoutJapanese = svg2png(svgWithoutJapaneseLine)
    // When Noto Sans CJK JP is installed, '林 純一' renders as visible pixels, making the PNG larger.
    // If the font is absent and glyphs are silently dropped, both PNGs are identical in size.
    // The difference is in the thousands of bytes (empirically ~3 KB), well above noise.
    expect(pngWithJapanese.length).toBeGreaterThan(pngWithoutJapanese.length)
  })
})
