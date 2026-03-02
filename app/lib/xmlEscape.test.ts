import { describe, expect, it } from 'vitest'
import { escapeXml } from './xmlEscape'

describe('escapeXml', () => {
  it('passes through plain text unchanged', () => {
    expect(escapeXml('hello world')).toBe('hello world')
  })

  it('escapes ampersands', () => {
    expect(escapeXml('a & b')).toBe('a &amp; b')
  })

  it('escapes less-than', () => {
    expect(escapeXml('<tag>')).toBe('&lt;tag&gt;')
  })

  it('escapes greater-than', () => {
    expect(escapeXml('a > b')).toBe('a &gt; b')
  })

  it('escapes double quotes', () => {
    expect(escapeXml('"quoted"')).toBe('&quot;quoted&quot;')
  })

  it('escapes single quotes', () => {
    expect(escapeXml("it's")).toBe("it&apos;s")
  })

  it('escapes all special characters together', () => {
    expect(escapeXml('<a href="x&y">it\'s</a>')).toBe(
      '&lt;a href=&quot;x&amp;y&quot;&gt;it&apos;s&lt;/a&gt;',
    )
  })
})
