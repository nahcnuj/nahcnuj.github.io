import { renderToReadableStream } from 'hono/jsx/dom/server'
import { describe, it } from 'vitest'
import { expectDownloadAdDialogHtml } from '../lib/downloadAdExpectations'
import DownloadAdDialog from './DownloadAdDialog'

async function renderDownloadAdDialog(): Promise<string> {
  const stream = await renderToReadableStream(DownloadAdDialog())
  return new Response(stream).text()
}

describe('DownloadAdDialog', () => {
  it('renders required popover, fallback link, and AdSense elements with expected attributes', async () => {
    const html = await renderDownloadAdDialog()
    expectDownloadAdDialogHtml(html)
  })
})