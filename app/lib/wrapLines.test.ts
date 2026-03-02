import { describe, expect, it } from 'vitest'
import { wrapLines } from './wrapLines'

describe('wrapLines', () => {
  it('returns single-element array for short text', () => {
    expect(wrapLines('Short title')).toEqual(['Short title'])
    expect(wrapLines('A')).toEqual(['A'])
    // exactly maxLen characters
    expect(wrapLines('12345678901234567890')).toEqual(['12345678901234567890'])
  })

  it('splits a Latin title at word boundaries', () => {
    const result = wrapLines('The quick brown fox jumps')
    expect(result.length).toBeGreaterThan(1)
    expect(result.every((line) => line.length <= 20)).toBe(true)
  })

  it('limits output to at most 3 lines for a long Latin title', () => {
    const result = wrapLines('The quick brown fox jumps over the lazy dog and runs')
    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('truncates the third Latin line with an ellipsis when text remains', () => {
    // Force remaining text after two lines: each word is 7 chars, maxLen=20 allows 2 per line.
    // With 7 words, the third line cannot contain all remaining words within maxLen, so it must be truncated.
    const result = wrapLines('aaaaaaa bbbbbbb ccccccc ddddddd eeeeeee fffffff ggggggg')
    expect(result.length).toBe(3)
    const third = result[2]
    // Third line must end with '…' when remaining text exceeds maxLen
    expect(third.endsWith('…')).toBe(true)
    expect(third.length).toBeLessThanOrEqual(20)
  })

  it('splits a long CJK title at character boundaries', () => {
    // 21 characters, no spaces → character split
    const title = 'あいうえおかきくけこさしすせそたちつてとな'
    const result = wrapLines(title)
    expect(result.length).toBeGreaterThan(1)
    expect(result[0].length).toBeLessThanOrEqual(20)
  })

  it('truncates the third CJK line with an ellipsis when text remains', () => {
    // 61 characters → 3 full chunks of 20 + 1 leftover → 3rd chunk must be truncated
    const title = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんあいうえおかきくけこさしすせそ'
    const result = wrapLines(title)
    expect(result.length).toBe(3)
    expect(result[2].endsWith('…')).toBe(true)
  })

  it('handles mixed punctuation and spaces correctly', () => {
    const result = wrapLines('Hello: World & More!')
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.every((line) => line.length <= 20)).toBe(true)
  })

  it('handles a title with exactly one word longer than maxLen', () => {
    const title = 'abcdefghijklmnopqrstuvwxyz'
    const result = wrapLines(title)
    expect(result.length).toBeGreaterThan(1)
  })

  describe('with maxLen=16 (OGP route default)', () => {
    it('keeps a 16-char CJK title on a single line', () => {
      const title = '日本語タイトルのフィクスチャ記事'
      expect(title.length).toBe(16)
      const result = wrapLines(title, 16)
      expect(result).toEqual([title])
    })

    it('wraps a 28-char CJK title to 2 lines, each ≤16 chars', () => {
      const title = '折り返しフィクスチャ：日本語のタイトルが複数行になる場合'
      expect(title.length).toBe(28)
      const result = wrapLines(title, 16)
      expect(result.length).toBe(2)
      expect(result.every((line) => line.length <= 16)).toBe(true)
    })
  })
})
