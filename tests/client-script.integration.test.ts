import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const DOWNLOAD_LINK_HTML = join(process.cwd(), 'dist/essays/download-link.html')

describe('production HTML includes global client script without islands', () => {
  it('download-link.html references the built client bundle', () => {
    if (!existsSync(DOWNLOAD_LINK_HTML)) {
      // Run after `npm run build` to verify SSG output.
      return
    }

    const html = readFileSync(DOWNLOAD_LINK_HTML, 'utf8')
    expect(html).toMatch(/<script[^>]*type="module"[^>]*src="\/static\/client-[^"]+\.js"/)
  })
})