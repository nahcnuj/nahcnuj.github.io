import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { verifyClientScriptOnIslandFreePages } from '../scripts/verify-client-script.mjs'

const DIST_DIR = join(process.cwd(), 'dist')

describe('production HTML includes global client script without islands', () => {
  it('every island-free page references the built client bundle', () => {
    if (!existsSync(DIST_DIR)) {
      // Run after `npm run build` to verify SSG output.
      return
    }

    const { checked, missing } = verifyClientScriptOnIslandFreePages(DIST_DIR)
    expect(checked).toBeGreaterThan(0)
    expect(missing).toEqual([])
  })
})