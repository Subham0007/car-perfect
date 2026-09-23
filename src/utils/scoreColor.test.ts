import { describe, it, expect } from 'vitest'
import { getScoreTier } from './scoreColor'

describe('getScoreTier', () => {
  it('returns green for scores >= 75', () => {
    expect(getScoreTier(75)).toBe('green')
    expect(getScoreTier(100)).toBe('green')
  })

  it('returns amber for scores between 50 and 74', () => {
    expect(getScoreTier(50)).toBe('amber')
    expect(getScoreTier(74)).toBe('amber')
  })

  it('returns red for scores below 50', () => {
    expect(getScoreTier(49)).toBe('red')
    expect(getScoreTier(0)).toBe('red')
  })
})
