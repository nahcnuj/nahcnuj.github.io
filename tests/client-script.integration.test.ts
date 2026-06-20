import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const INDEX_HTML = join(process.cwd(), 'dist/index.html')

describe('production HTML includes global client script without islands', () => {
  it('index.html references the built client bundle', () => {
    if (!existsSync(INDEX_HTML)) {
      // Run after `npm run build` to verify SSG output.
      return
    }

    const html = readFileSync(INDEX_HTML, 'utf8')
    expect(html).toMatch(/<script[^>]*type="module"[^>]*src="\/static\/client-[^"]+\.js"/)
  })
})