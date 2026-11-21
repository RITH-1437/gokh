import { describe, it, expect } from 'vitest'
import { parseSeasonMonths, isInSeason } from '../utils/season'
import { ROUTE_TEMPLATES, planRouteTemplate } from './routes'
import { CAMBODIAN_DESTINATIONS, findDestination } from './destinations'
import { PRE_TRIP_CHECKLIST } from './essentials'
import { useTrip } from '../composables/useTrip'

describe('season', () => {
  it('parses simple, wrapping and all-year seasons', () => {
    expect(parseSeasonMonths('Jun–Dec')).toEqual([6, 7, 8, 9, 10, 11, 12])
    expect(parseSeasonMonths('Nov–Mar')).toEqual([11, 12, 1, 2, 3])
    expect(parseSeasonMonths('All year')).toHaveLength(12)
    expect(parseSeasonMonths('whenever')).toEqual([])
  })

  it('tells whether a month is in season', () => {
    expect(isInSeason('Nov–Mar', 1)).toBe(true)
    expect(isInSeason('Nov–Mar', 7)).toBe(false)
    expect(isInSeason(undefined, 7)).toBeNull()
  })

  it('every catalog season string is parseable', () => {
    for (const d of CAMBODIAN_DESTINATIONS) {
      expect(parseSeasonMonths(d.bestSeason).length, d.name).toBeGreaterThan(0)
    }
  })
})

describe('route templates', () => {
  it('match the report lengths (7, 10, 14 days)', () => {
    expect(ROUTE_TEMPLATES.map(t => t.days.length)).toEqual([7, 10, 14])
    expect(ROUTE_TEMPLATES.every(t => t.days.every(d => d.length > 0))).toBe(true)
  })

  it('only fills empty days and is cut to the trip length', () => {
    const plan = planRouteTemplate(ROUTE_TEMPLATES[0], [false, true, false])
    expect(plan.map(p => p.dayIndex)).toEqual([0, 2])
    expect(plan[0].names[0]).toBe('Arrive Phnom Penh (KTI)')
  })

  it('leaves extra trip days beyond the template empty', () => {
    const plan = planRouteTemplate(ROUTE_TEMPLATES[0], Array(9).fill(false))
    expect(plan).toHaveLength(7)
  })
})

describe('destination fees & tips', () => {
  it('has the Angkor Pass prices from the report', () => {
    const prices = findDestination('Angkor Wat')!.fees!.map(f => f.price)
    expect(prices).toEqual(['$37', '$62', '$72'])
  })

  it('carries the memorial-site content note for Phnom Penh', () => {
    expect(findDestination('Phnom Penh')!.tips!.join(' ')).toMatch(/not suitable for young children/)
  })
})

describe('crew checklist', () => {
  it('toggles items on and off', () => {
    const t = useTrip()
    const id = PRE_TRIP_CHECKLIST[0].id
    t.toggleChecklistItem(id)
    expect(t.trip.value.checklist).toEqual([id])
    t.toggleChecklistItem(id)
    expect(t.trip.value.checklist).toEqual([])
  })
})
