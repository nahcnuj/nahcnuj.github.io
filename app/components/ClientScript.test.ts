import { renderToReadableStream } from 'hono/jsx/dom/server'
import { describe, expect, it } from 'vitest'
import ClientScript from './ClientScript'

async function renderClientScript(): Promise<string> {
  const stream = await renderToReadableStream(ClientScript({ async: true }))
  return new Response(stream).text()
}

describe('ClientScript', () => {
  it('renders the dev client entry in non-production builds', async () => {
    const html = await renderClientScript()
    expect(html).toContain('src="/app/client.ts"')
    expect(html).toContain('type="module"')
  })
})