import { renderToReadableStream } from 'hono/jsx/dom/server'
import { beforeAll, describe, expect, it } from 'vitest'
import MakamujoBanner from './MakamujoBanner'

type Area = { shape: string; coords: string; href: string }

/** Extract <area> elements from an HTML string. */
function parseAreas(html: string): Area[] {
  const areas: Area[] = []
  for (const match of html.matchAll(/<area\s[^>]+>/g)) {
    const tag = match[0]
    const shape = tag.match(/shape="([^"]+)"/)?.[1] ?? ''
    const coords = tag.match(/coords="([^"]+)"/)?.[1] ?? ''
    const href = tag.match(/href="([^"]+)"/)?.[1] ?? ''
    areas.push({ shape, coords, href })
  }
  return areas
}

/**
 * Image-map hit test: return the href of the first <area> that contains (x, y),
 * following the HTML image-map algorithm (rect check, then default fallback).
 */
function hitTest(x: number, y: number, areas: Area[]): string | undefined {
  for (const area of areas) {
    if (area.shape === 'rect') {
      const [x1, y1, x2, y2] = area.coords.split(',').map(Number)
      if (x >= x1 && x <= x2 && y >= y1 && y <= y2) return area.href
    } else if (area.shape === 'default') {
      return area.href
    }
  }
}

describe('MakamujoBanner click behavior', () => {
  let areas: Area[]

  beforeAll(async () => {
    const stream = await renderToReadableStream(MakamujoBanner({}))
    const html = await new Response(stream).text()
    areas = parseAreas(html)
  })

  it('clicking the NicoNico badge navigates to the program viewing page', () => {
    // Center of badge rect (105,67,306,87) → (205, 77)
    const dest = hitTest(205, 77, areas)
    expect(dest).toBe('https://live.nicovideo.jp/watch/user/14171889')
  })

  it('clicking outside the badge navigates to the Makamujo landing page', () => {
    // Top-left area of banner, outside the badge rect
    const dest = hitTest(50, 30, areas)
    expect(dest).toBe('https://www.nahcnuj.work/makamujo/index.html')
  })

  it('all clickable areas open in a new tab safely', async () => {
    const stream = await renderToReadableStream(MakamujoBanner({}))
    const html = await new Response(stream).text()
    const targetCount = (html.match(/target="_blank"/g) ?? []).length
    const relCount = (html.match(/rel="noopener noreferrer"/g) ?? []).length
    expect(targetCount).toBe(2)
    expect(relCount).toBe(2)
  })
})
