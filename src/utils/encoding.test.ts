import { describe, it, expect } from 'vitest'
import { encodeTripToUrl, decodeTripFromUrl, generateTripUrl, readTripFromUrl } from './encoding'
import type { Trip } from '../types/trip'

const trip: Trip = {
  tripName: 'ដំណើរកម្សាន្ត 🇰🇭',
  destination: 'Kampot',
  members: [{ id: 'm1', name: 'សុខា', role: 'leader' }],
  startDate: '2026-12-10',
  endDate: '2026-12-11',
  transportation: { type: 'bus', note: '' },
  accommodation: { type: 'camping', name: '' },
  budget: { total: 400000, currency: 'KHR', contributions: [{ memberId: 'm1', amount: 400000, currency: 'KHR' }] },
  itinerary: [
    { dayNumber: 1, date: '2026-12-10', activities: [{ id: 'a1', name: 'Pepper farm 🌶️', description: '', startTime: '', endTime: '' }] },
    { dayNumber: 2, date: '2026-12-11', activities: [] }
  ],
  checklist: ['visa', 'cash']
}

describe('share link encoding', () => {
  it('round-trips a trip including Khmer text and emoji', async () => {
    const encoded = await encodeTripToUrl(trip)
    expect(encoded).toMatch(/^z\.[A-Za-z0-9_-]+$/) // compressed prefix + URL-safe, no padding
    expect(await decodeTripFromUrl(encoded)).toEqual(trip)
  })

  it('compressed link is shorter than raw JSON', async () => {
    const encoded = await encodeTripToUrl(trip)
    const rawLength = new TextEncoder().encode(JSON.stringify(trip)).length
    // The compressed+base64 payload (after the 'z.' prefix) should be shorter than the raw JSON
    expect(encoded.length).toBeLessThan(rawLength)
  })

  it('builds a link on the given origin', async () => {
    expect(await generateTripUrl(trip, 'https://gokh.example')).toMatch(/^https:\/\/gokh\.example\/\?trip=/)
  })

  it('returns null for garbage', async () => {
    expect(await decodeTripFromUrl('%%%not-base64%%%')).toBeNull()
    expect(await decodeTripFromUrl('a'.repeat(250_000))).toBeNull()
  })

  it('distinguishes none / invalid / loaded', async () => {
    expect(await readTripFromUrl('')).toEqual({ status: 'none' })
    expect(await readTripFromUrl('?foo=1')).toEqual({ status: 'none' })
    expect(await readTripFromUrl('?trip=garbage')).toEqual({ status: 'invalid' })
    const encoded = await encodeTripToUrl(trip)
    const result = await readTripFromUrl(`?trip=${encoded}`)
    expect(result.status).toBe('loaded')
  })

  it('a truncated compressed link is reported as invalid rather than half-loaded', async () => {
    const encoded = await encodeTripToUrl(trip)
    expect(await readTripFromUrl(`?trip=${encoded.slice(0, encoded.length / 2)}`)).toEqual({ status: 'invalid' })
  })

  it('backward-compat: legacy plain-base64 links are still decoded correctly', async () => {
    // Build a legacy link the old way (plain UTF-8 → base64, no "z." prefix)
    const json = JSON.stringify(trip)
    const bytes = new TextEncoder().encode(json)
    let binary = ''
    bytes.forEach((b) => (binary += String.fromCharCode(b)))
    const legacyEncoded = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    // Should still decode correctly even without the "z." prefix
    expect(await decodeTripFromUrl(legacyEncoded)).toEqual(trip)
  })
})
