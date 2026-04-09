import { afterEach, describe, expect, it, vi } from 'vitest'
import { pickRandomN } from './random'

describe('pickRandomN', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty array when input is empty', () => {
    expect(pickRandomN([], 3)).toEqual([])
  })

  it('returns all elements when n equals the array length', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = pickRandomN([1, 2, 3], 3)
    expect(result).toHaveLength(3)
    expect(result).toEqual(expect.arrayContaining([1, 2, 3]))
  })

  it('returns n elements when n is less than the array length', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = pickRandomN([1, 2, 3, 4, 5], 3)
    expect(result).toHaveLength(3)
  })

  it('returns all elements when n exceeds the array length', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = pickRandomN([1, 2], 5)
    expect(result).toHaveLength(2)
    expect(result).toEqual(expect.arrayContaining([1, 2]))
  })

  it('does not mutate the original array', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const original = [1, 2, 3]
    pickRandomN(original, 2)
    expect(original).toEqual([1, 2, 3])
  })

  it('picks elements according to Math.random', () => {
    // Fisher-Yates with Math.random always returning 0:
    // Each swap picks index 0, so the array is reversed.
    // [1,2,3,4] -> swap(3,0) -> [4,2,3,1] -> swap(2,0) -> [3,2,4,1] -> swap(1,0) -> [2,3,4,1]
    // slice(0,2) = [2,3]
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = pickRandomN([1, 2, 3, 4], 2)
    expect(result).toEqual([2, 3])
  })
})
