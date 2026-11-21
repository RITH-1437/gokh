import { describe, it, expect } from 'vitest'
import { sanitizeTrip, LIMITS } from './tripSchema'
import { MAX_TRIP_DAYS } from './dates'

const baseTrip = () => ({
  tripName: 'Angkor Wat Trip',
  destination: 'Siem Reap',
  members: [
    { id: 'a', name: 'Dara', role: 'leader' },
    { id: 'b', name: 'Sophea', role: 'member' }
  ],
  startDate: '2026-12-01',
  endDate: '2026-12-03',
  transportation: { type: 'van', note: '' },
  accommodation: { type: 'guesthouse', name: 'Green House' },
  budget: {
    total: 300,
    currency: 'USD',
    contributions: [{ memberId: 'a', amount: 150, currency: 'USD' }]
  },
  itinerary: [
    { dayNumber: 1, date: '2026-12-01', activities: [{ id: 'x', name: 'Sunrise at Angkor', startTime: '05:00', endTime: '07:30', description: '' }] },
    { dayNumber: 2, date: '2026-12-02', activities: [] },
    { dayNumber: 3, date: '2026-12-03', activities: [] }
  ]
})

describe('sanitizeTrip', () => {
  it('passes a well-formed trip through unchanged in substance', () => {
    const trip = sanitizeTrip(baseTrip())
    expect(trip).not.toBeNull()
    expect(trip!.tripName).toBe('Angkor Wat Trip')
    expect(trip!.members).toHaveLength(2)
    expect(trip!.budget.contributions).toEqual([{ memberId: 'a', amount: 150, currency: 'USD' }])
    expect(trip!.itinerary[0].activities[0]).toMatchObject({ id: 'x', name: 'Sunrise at Angkor', startTime: '05:00' })
  })

  it.each([null, 42, 'trip', [], { foo: 1 }, { tripName: 1, destination: '' }])(
    'rejects non-trip payload %j',
    payload => {
      expect(sanitizeTrip(payload)).toBeNull()
    }
  )

  it('repairs a payload with missing nested objects instead of crashing', () => {
    const trip = sanitizeTrip({ tripName: '', destination: '' })
    expect(trip).toEqual({
      tripName: '',
      destination: '',
      members: [],
      startDate: '',
      endDate: '',
      transportation: { type: 'motorcycle', note: '' },
      accommodation: { type: 'hotel', name: '' },
      budget: { total: 0, currency: 'USD', contributions: [] },
      itinerary: [],
      checklist: []
    })
  })

  it('keeps only known checklist ids, once each', () => {
    expect(sanitizeTrip({ ...baseTrip(), checklist: ['cash', 'hack', 'visa', 'cash', 7] })!.checklist).toEqual(['visa', 'cash'])
    expect(sanitizeTrip({ ...baseTrip(), checklist: 'visa' })!.checklist).toEqual([])
  })

  it('drops malformed itinerary entries that previously crashed rendering', () => {
    const trip = sanitizeTrip({ ...baseTrip(), itinerary: [{}, null, { activities: 'nope' }, { activities: [null, { name: '' }, { name: 'Ok' }] }] })
    expect(trip!.itinerary).toHaveLength(4)
    expect(trip!.itinerary.every(d => Array.isArray(d.activities))).toBe(true)
    expect(trip!.itinerary.map(d => d.dayNumber)).toEqual([1, 2, 3, 4])
    expect(trip!.itinerary[3].activities.map(a => a.name)).toEqual(['Ok'])
  })

  it('enforces exactly one leader', () => {
    const none = sanitizeTrip({ ...baseTrip(), members: [{ id: '1', name: 'A', role: 'member' }, { id: '2', name: 'B', role: 'member' }] })
    expect(none!.members.map(m => m.role)).toEqual(['leader', 'member'])

    const many = sanitizeTrip({ ...baseTrip(), members: [{ id: '1', name: 'A', role: 'member' }, { id: '2', name: 'B', role: 'leader' }, { id: '3', name: 'C', role: 'leader' }] })
    expect(many!.members.map(m => m.role)).toEqual(['member', 'leader', 'member'])
  })

  it('removes invalid and duplicate members and regenerates clashing ids', () => {
    const trip = sanitizeTrip({
      ...baseTrip(),
      members: [
        { id: 'a', name: 'Dara', role: 'leader' },
        { id: 'a', name: 'Vanna' },
        { id: 'c', name: 'dara' },
        { id: 'd', name: '   ' },
        'junk',
        { id: 'e', name: 123 }
      ]
    })
    expect(trip!.members.map(m => m.name)).toEqual(['Dara', 'Vanna'])
    const ids = trip!.members.map(m => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('drops contributions for unknown members, duplicates and bad amounts', () => {
    const trip = sanitizeTrip({
      ...baseTrip(),
      budget: {
        total: -50,
        currency: 'EUR',
        contributions: [
          { memberId: 'ghost', amount: 10, currency: 'USD' },
          { memberId: 'a', amount: -10, currency: 'USD' },
          { memberId: 'a', amount: 99, currency: 'USD' },
          { memberId: 'b', amount: Number.NaN, currency: 'XYZ' }
        ]
      }
    })
    expect(trip!.budget.total).toBe(0)
    expect(trip!.budget.currency).toBe('USD')
    expect(trip!.budget.contributions).toEqual([
      { memberId: 'a', amount: 0, currency: 'USD' },
      { memberId: 'b', amount: 0, currency: 'USD' }
    ])
  })

  it('falls back to defaults for unknown enum values', () => {
    const trip = sanitizeTrip({ ...baseTrip(), transportation: { type: 'rocket' }, accommodation: { type: 'castle' } })
    expect(trip!.transportation.type).toBe('motorcycle')
    expect(trip!.accommodation.type).toBe('hotel')
  })

  it('rejects impossible dates and over-long or reversed ranges', () => {
    expect(sanitizeTrip({ ...baseTrip(), startDate: '2026-02-30' })!.startDate).toBe('')
    expect(sanitizeTrip({ ...baseTrip(), endDate: '2026-11-01' })!.endDate).toBe('')
    expect(sanitizeTrip({ ...baseTrip(), endDate: '9999-12-31' })!.endDate).toBe('')
  })

  it('caps itinerary length and string lengths', () => {
    const many = Array.from({ length: MAX_TRIP_DAYS + 50 }, () => ({ activities: [] }))
    const trip = sanitizeTrip({ ...baseTrip(), tripName: 'x'.repeat(1000), itinerary: many })
    expect(trip!.itinerary).toHaveLength(MAX_TRIP_DAYS)
    expect(trip!.tripName).toHaveLength(LIMITS.tripName)
  })

  it('blanks malformed activity times', () => {
    const trip = sanitizeTrip({
      ...baseTrip(),
      itinerary: [{ activities: [{ name: 'A', startTime: '25:00', endTime: '<script>' }] }]
    })
    expect(trip!.itinerary[0].activities[0]).toMatchObject({ startTime: '', endTime: '' })
  })
})
