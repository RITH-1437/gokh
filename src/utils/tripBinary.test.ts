import { describe, it, expect } from 'vitest'
import { readTripBinary, writeTripBinary } from './tripBinary'
import { sanitizeTrip } from './tripSchema'
import type { Trip } from '../types/trip'

const full: Trip = {
  tripName: 'ដំណើរ Kampot 🇰🇭',
  destination: 'Kampot',
  members: [
    { id: 'u1', name: 'សុខា', role: 'member' },
    { id: 'u2', name: 'Dara', role: 'leader' },
    { id: 'u3', name: 'Bopha', role: 'member' },
  ],
  startDate: '2026-12-30',
  endDate: '2027-01-02',
  transportation: { type: 'bus', note: 'Giant Ibis 8am' },
  accommodation: { type: 'camping', name: 'Bokor camp' },
  budget: {
    total: 1234.56,
    currency: 'USD',
    contributions: [
      { memberId: 'u3', amount: 400000, currency: 'KHR' },
      { memberId: 'u2', amount: 99.99, currency: 'USD' },
    ],
  },
  itinerary: [
    { dayNumber: 1, date: '2026-12-30', activities: [{ id: 'a', name: 'Pepper Farm Tour', description: 'Book ahead', startTime: '08:05', endTime: '23:59' }] },
    { dayNumber: 2, date: '2026-12-31', activities: [] },
    { dayNumber: 3, date: '2027-01-01', activities: [{ id: 'b', name: 'My own idea 🌶️', description: '', startTime: '00:00', endTime: '' }] },
    { dayNumber: 4, date: '2027-01-02', activities: [{ id: 'c', name: 'Salt Fields', description: '', startTime: '', endTime: '' }] },
  ],
  checklist: ['visa', 'advice'],
}

const roundTrip = (t: Trip) => sanitizeTrip(readTripBinary(writeTripBinary(t)).raw)!

// Ids are regenerated, so compare contributions by traveler position instead.
const stripIds = (t: Trip) => ({
  ...t,
  members: t.members.map(({ name, role }) => ({ name, role })),
  budget: {
    ...t.budget,
    contributions: t.budget.contributions.map(c => ({ ...c, memberId: t.members.findIndex(m => m.id === c.memberId) })),
  },
  itinerary: t.itinerary.map(d => ({ ...d, activities: d.activities.map(({ id: _id, ...a }) => a) })),
})

describe('binary trip codec', () => {
  it('round-trips every field: typed + catalog text, Khmer, emoji, cents, KHR, times, year change', () => {
    expect(stripIds(roundTrip(full))).toEqual(stripIds(full))
  })

  it('round-trips an empty trip', () => {
    const empty: Trip = {
      tripName: '',
      destination: '',
      members: [],
      startDate: '',
      endDate: '',
      transportation: { type: 'motorcycle', note: '' },
      accommodation: { type: 'hotel', name: '' },
      budget: { total: 0, currency: 'USD', contributions: [] },
      itinerary: [],
      checklist: [],
    }
    expect(roundTrip(empty)).toEqual(empty)
  })

  it('keeps the share time to the minute', () => {
    const at = new Date('2027-03-04T05:06:00Z')
    expect(readTripBinary(writeTripBinary(full, at)).sharedAt).toEqual(at)
  })

  it('stores catalog phrases as tiny codes', () => {
    const catalog: Trip = { ...full, tripName: 'Bokor Hill Station Trip' }
    const typed: Trip = { ...full, tripName: 'Bokor Hill Station Trap' }
    expect(writeTripBinary(typed).length - writeTripBinary(catalog).length).toBeGreaterThan(20)
  })

  it('rejects malformed bytes instead of guessing', () => {
    const bytes = writeTripBinary(full)
    expect(() => readTripBinary(bytes.slice(0, -1))).toThrow()
    expect(() => readTripBinary(new Uint8Array([...bytes, 0]))).toThrow()
    expect(() => readTripBinary(new Uint8Array([0, 0xff, 0xff, 0x7f]))).toThrow() // phrase index out of range
    expect(() => readTripBinary(new Uint8Array([0, 0, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0x0f]))).toThrow() // absurd member count
    expect(() => readTripBinary(new Uint8Array(0))).toThrow()
  })
})
