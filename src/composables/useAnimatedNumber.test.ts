import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAnimatedNumber } from './useAnimatedNumber'

const mockReducedMotion = (reduce: boolean) => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

describe('useAnimatedNumber', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('jumps straight to the value when the user prefers reduced motion', () => {
    mockReducedMotion(true)
    const { value, set } = useAnimatedNumber(400)
    set(150)
    expect(value.value).toBe(150)
  })

  it('animates (does not jump) when motion is allowed', () => {
    mockReducedMotion(false)
    const { value, set } = useAnimatedNumber(400)
    set(150)
    expect(value.value).toBe(0)
  })
})
