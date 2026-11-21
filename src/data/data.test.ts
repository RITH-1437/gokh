import { describe, it, expect } from 'vitest'
import { CAMBODIAN_DESTINATIONS, POPULAR_DESTINATIONS, findDestination } from './destinations'
import { ACTIVITY_SUGGESTIONS, getSuggestionsForDestination } from './activities'

describe('destination catalog', () => {
  it('has unique names, coordinates inside Cambodia and suggestions for every place', () => {
    const names = CAMBODIAN_DESTINATIONS.map(d => d.name.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
    for (const d of CAMBODIAN_DESTINATIONS) {
      expect(d.coordinates, d.name).toBeDefined()
      expect(d.coordinates!.lat).toBeGreaterThan(9.5)
      expect(d.coordinates!.lat).toBeLessThan(15)
      expect(d.coordinates!.lon).toBeGreaterThan(102)
      expect(d.coordinates!.lon).toBeLessThan(108)
      expect(ACTIVITY_SUGGESTIONS[d.name], d.name).toBeDefined()
      expect(d.days, d.name).toBeTruthy()
      expect(d.bestSeason, d.name).toBeTruthy()
    }
  })

  it('has no duplicate suggestions within a destination', () => {
    for (const [name, list] of Object.entries(ACTIVITY_SUGGESTIONS)) {
      expect(new Set(list.map(s => s.toLowerCase())).size, name).toBe(list.length)
    }
  })

  it('keeps every popular destination illustrated', () => {
    expect(POPULAR_DESTINATIONS.length).toBe(7)
    expect(POPULAR_DESTINATIONS.every(d => d.image)).toBe(true)
  })

  it('flags Koh Kong with a border advisory', () => {
    expect(findDestination('koh kong')?.advisory).toMatch(/border/i)
    expect(findDestination('tatai river')?.advisory).toMatch(/border/i)
  })

  it('includes the extra report destinations, each with a credited photo', () => {
    for (const name of ['Banteay Srei', 'Roluos Group', 'Koh Dach', 'Koh Tonsay', 'Tatai River', 'Stung Treng']) {
      const dest = findDestination(name)
      expect(dest, name).toBeDefined()
      expect(dest!.image, name).toMatch(/^https:\/\/thumb\.wikimedia\.org\//)
      expect(dest!.imageCredit?.author, name).toBeTruthy()
    }
  })

  it('every remote photo is on an origin allowed by the CSP', () => {
    for (const d of CAMBODIAN_DESTINATIONS) {
      if (typeof d.image === 'string' && d.image.startsWith('http')) {
        expect(d.image, d.name).toMatch(/^https:\/\/(thumb|upload)\.wikimedia\.org\//)
        expect(d.imageCredit, d.name).toBeDefined()
      }
    }
  })
})

describe('getSuggestionsForDestination', () => {
  it('REGRESSION: Koh Rong Sanloem gets its own list, not Koh Rong', () => {
    expect(getSuggestionsForDestination('Koh Rong Sanloem')[0]).toBe('Saracen Bay')
    expect(getSuggestionsForDestination('Koh Rong')[0]).toBe('Long Set Beach')
  })

  it('REGRESSION: an empty or tiny query suggests nothing', () => {
    expect(getSuggestionsForDestination('')).toEqual([])
    expect(getSuggestionsForDestination('  ')).toEqual([])
    expect(getSuggestionsForDestination('Ke')).toEqual([])
  })

  it('matches case-insensitively, inside longer text, and by prefix', () => {
    expect(getSuggestionsForDestination('kampot')[0]).toBe('Pepper Farm Tour')
    expect(getSuggestionsForDestination('Weekend in Kampot')[0]).toBe('Pepper Farm Tour')
    expect(getSuggestionsForDestination('Angkor')[0]).toBe('Sunrise at Angkor Wat')
    expect(getSuggestionsForDestination('Somewhere else')).toEqual([])
  })
})
