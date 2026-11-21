import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useTrip, isTripEmpty } from './useTrip'
import { encodeTripToUrl } from '../utils/encoding'
import { STORAGE_KEY } from '../utils/storage'

const setDates = async (t: ReturnType<typeof useTrip>, start: string, end: string) => {
  t.trip.value.startDate = start
  t.trip.value.endDate = end
  await nextTick()
}

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
})

describe('members', () => {
  it('makes the first traveler the leader and keeps exactly one leader', () => {
    const t = useTrip()
    t.addMember('Dara')
    t.addMember('Sophea')
    expect(t.trip.value.members.map(m => m.role)).toEqual(['leader', 'member'])

    t.updateMember(t.trip.value.members[1].id, { role: 'leader' })
    expect(t.trip.value.members.map(m => m.role)).toEqual(['member', 'leader'])
  })

  it('gives members unique ids even when added in the same millisecond', () => {
    const t = useTrip()
    vi.spyOn(Date, 'now').mockReturnValue(1)
    t.addMember('A')
    t.addMember('B')
    const [a, b] = t.trip.value.members
    expect(a.id).not.toBe(b.id)
  })

  it('removing the leader promotes someone and drops their contribution', () => {
    const t = useTrip()
    t.addMember('Dara')
    t.addMember('Sophea')
    const leaderId = t.trip.value.members[0].id
    t.updateContribution(leaderId, 50, 'USD')
    t.removeMember(leaderId)
    expect(t.trip.value.members).toHaveLength(1)
    expect(t.trip.value.members[0].role).toBe('leader')
    expect(t.trip.value.budget.contributions).toEqual([])
  })
})

describe('itinerary dates', () => {
  it('builds one day per date and keeps activities when the range grows', async () => {
    const t = useTrip()
    await setDates(t, '2026-12-01', '2026-12-02')
    expect(t.trip.value.itinerary.map(d => d.date)).toEqual(['2026-12-01', '2026-12-02'])

    t.trip.value.itinerary[0].activities.push({ id: 'a', name: 'Sunrise' })
    await setDates(t, '2026-12-01', '2026-12-04')
    expect(t.trip.value.itinerary).toHaveLength(4)
    expect(t.trip.value.itinerary[0].activities[0].name).toBe('Sunrise')
  })

  it('REGRESSION: an end date before the start no longer deletes the itinerary', async () => {
    const t = useTrip()
    await setDates(t, '2026-12-01', '2026-12-03')
    t.trip.value.itinerary[1].activities.push({ id: 'a', name: 'Floating village' })

    await setDates(t, '2026-12-05', '2026-12-03') // invalid range
    expect(t.trip.value.itinerary).toHaveLength(3)
    expect(t.trip.value.itinerary[1].activities[0].name).toBe('Floating village')
  })

  it('ignores absurdly long ranges instead of generating thousands of days', async () => {
    const t = useTrip()
    await setDates(t, '2026-12-01', '2099-12-31')
    expect(t.trip.value.itinerary).toEqual([])
  })
})

describe('budget', () => {
  it('converts mixed-currency contributions into the budget currency', () => {
    const t = useTrip()
    t.addMember('A')
    t.addMember('B')
    const [a, b] = t.trip.value.members
    t.trip.value.budget.total = 100
    t.updateContribution(a.id, 50, 'USD')
    t.updateContribution(b.id, 200000, 'KHR') // = $50
    expect(t.totalContributed.value).toBe(100)
    expect(t.budgetStatus.value).toBe('funded')
    expect(t.perPersonBudget.value).toBe(50)
  })

  it('never stores a negative or non-numeric contribution', () => {
    const t = useTrip()
    t.addMember('A')
    const id = t.trip.value.members[0].id
    t.updateContribution(id, -20, 'USD')
    expect(t.getContributionForMember(id)?.amount).toBe(0)
    t.updateContribution(id, Number.NaN, 'USD')
    expect(t.getContributionForMember(id)?.amount).toBe(0)
  })
})

describe('shared links', () => {
  it('loads a shared trip, strips the param and tracks later edits', async () => {
    const shared = useTrip()
    shared.trip.value.tripName = 'Shared'
    shared.trip.value.destination = 'Kep'
    window.history.replaceState({}, '', `/?trip=${await encodeTripToUrl(shared.trip.value)}`)

    const t = useTrip()
    expect(await t.loadTripFromUrl()).toBe('loaded')
    expect(t.trip.value.destination).toBe('Kep')
    expect(window.location.search).toBe('')
    expect(t.loadedFromUrl.value).toBe(true)
    expect(t.hasUnsavedEdits.value).toBe(false)

    t.trip.value.tripName = 'Edited'
    await nextTick()
    expect(t.hasUnsavedEdits.value).toBe(true)
  })

  it('reports a broken link and leaves the planner empty', async () => {
    window.history.replaceState({}, '', '/?trip=broken')
    const t = useTrip()
    expect(await t.loadTripFromUrl()).toBe('invalid')
    expect(window.location.search).toBe('')
    expect(isTripEmpty(t.trip.value)).toBe(true)
  })

  it('returns none when there is no shared trip', async () => {
    expect(await useTrip().loadTripFromUrl()).toBe('none')
  })
})

describe('persistence', () => {
  it('autosaves and restores the draft', async () => {
    vi.useFakeTimers()
    const t = useTrip({ persist: true })
    t.trip.value.destination = 'Kampot'
    await nextTick()
    vi.advanceTimersByTime(300)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).destination).toBe('Kampot')

    const next = useTrip({ persist: true })
    expect(await next.restoreSavedTrip()).toBe(true)
    expect(next.trip.value.destination).toBe('Kampot')
  })

  it('does not restore an empty or corrupted draft', async () => {
    const t = useTrip({ persist: true })
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(await t.restoreSavedTrip()).toBe(false)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t.trip.value))
    expect(await t.restoreSavedTrip()).toBe(false)
  })

  it('does nothing when persistence is off', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tripName: 'X', destination: 'Kep' }))
    expect(await useTrip().restoreSavedTrip()).toBe(false)
  })

  it('reset clears the saved draft and the shared-trip flags', () => {
    const t = useTrip({ persist: true })
    localStorage.setItem(STORAGE_KEY, '{}')
    t.loadedFromUrl.value = true
    t.resetTrip()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(t.loadedFromUrl.value).toBe(false)
  })
})
