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
  it('round-trips a trip including Khmer text and emoji', () => {
    const encoded = encodeTripToUrl(trip)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/) // URL-safe, no padding
    expect(decodeTripFromUrl(encoded)).toEqual(trip)
  })

  it('builds a link on the given origin', () => {
    expect(generateTripUrl(trip, 'https://gokh.example')).toMatch(/^https:\/\/gokh\.example\/\?trip=/)
  })

  it('returns null for garbage', () => {
    expect(decodeTripFromUrl('%%%not-base64%%%')).toBeNull()
    expect(decodeTripFromUrl(btoa('not json'))).toBeNull()
    expect(decodeTripFromUrl('a'.repeat(250_000))).toBeNull()
  })

  it('distinguishes none / invalid / loaded', () => {
    expect(readTripFromUrl('')).toEqual({ status: 'none' })
    expect(readTripFromUrl('?foo=1')).toEqual({ status: 'none' })
    expect(readTripFromUrl('?trip=garbage')).toEqual({ status: 'invalid' })
    const result = readTripFromUrl(`?trip=${encodeTripToUrl(trip)}`)
    expect(result.status).toBe('loaded')
  })

  it('a truncated link is reported as invalid rather than half-loaded', () => {
    const encoded = encodeTripToUrl(trip)
    expect(readTripFromUrl(`?trip=${encoded.slice(0, encoded.length / 2)}`)).toEqual({ status: 'invalid' })
  })
})
