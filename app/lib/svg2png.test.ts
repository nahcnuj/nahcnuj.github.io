import { describe, expect, it } from 'vitest'
import { svg2png } from './svg2png'

const SIMPLE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>'

// PNG magic bytes: 0x89 0x50 0x4E 0x47 (\x89PNG)
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47]

describe('svg2png', () => {
  it('returns a Uint8Array', () => {
    const result = svg2png(SIMPLE_SVG)
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('output starts with PNG magic bytes', () => {
    const result = svg2png(SIMPLE_SVG)
    expect(Array.from(result.slice(0, 4))).toEqual(PNG_MAGIC)
  })

  it('produces non-empty output', () => {
    const result = svg2png(SIMPLE_SVG)
    expect(result.length).toBeGreaterThan(0)
  })
})
