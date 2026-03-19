import { renderToReadableStream } from 'hono/jsx/dom/server'
import { describe, expect, it } from 'vitest'
import MakamujoBanner from './MakamujoBanner'

async function renderToHtml(): Promise<string> {
  const stream = await renderToReadableStream(MakamujoBanner({}))
  return new Response(stream).text()
}

describe('MakamujoBanner', () => {
  it('renders an img with the banner src', async () => {
    const html = await renderToHtml()
    expect(html).toContain('src="https://www.nahcnuj.work/makamujo/banner.png"')
  })

  it('references the image map', async () => {
    const html = await renderToHtml()
    expect(html).toContain('usemap="#makamujo-banner-map"')
    expect(html).toContain('name="makamujo-banner-map"')
  })

  it('has a rect area for the NicoNico badge linking to the live page', async () => {
    const html = await renderToHtml()
    expect(html).toContain('shape="rect"')
    expect(html).toContain('coords="105,67,306,87"')
    expect(html).toContain('href="https://live.nicovideo.jp/watch/user/14171889"')
  })

  it('has a default area linking to the Makamujo landing page', async () => {
    const html = await renderToHtml()
    expect(html).toContain('shape="default"')
    expect(html).toContain('href="https://www.nahcnuj.work/makamujo/index.html"')
  })

  it('opens all links in a new tab with noopener noreferrer', async () => {
    const html = await renderToHtml()
    const targetCount = (html.match(/target="_blank"/g) ?? []).length
    const relCount = (html.match(/rel="noopener noreferrer"/g) ?? []).length
    expect(targetCount).toBe(2)
    expect(relCount).toBe(2)
  })
})
