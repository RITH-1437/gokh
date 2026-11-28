import { describe, it, expect, vi, afterEach } from 'vitest'
import { useTripShare } from './useTripShare'
import { decodeShareLink } from '../utils/encoding'
import type { Trip } from '../types/trip'

const trip: Trip = {
  tripName: 'Kep weekend',
  destination: 'Kep',
  members: [],
  startDate: '',
  endDate: '',
  transportation: { type: 'bus', note: '' },
  accommodation: { type: 'hotel', name: '' },
  budget: { total: 0, currency: 'USD', contributions: [] },
  itinerary: [],
  checklist: [],
}

afterEach(() => {
  vi.restoreAllMocks()
  window.history.replaceState({}, '', '/')
})

describe('useTripShare', () => {
  it('copies exactly the link it shows, with a matching link id', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })

    const s = useTripShare()
    expect(await s.shareTrip(trip)).toBe(true)
    expect(writeText).toHaveBeenCalledWith(s.shareUrl.value)
    const opened = await decodeShareLink(new URL(s.shareUrl.value).hash.slice(1))
    expect(opened?.link.id).toBe(s.shareInfo.value?.id)
  })

  // Regression: sharing used to write the link into the address bar, so a
  // refresh re-opened that old snapshot as a "shared trip" and overwrote every
  // edit made after sharing.
  it('does not put the share link in the address bar', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true })
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })

    await useTripShare().shareTrip(trip)
    expect(window.location.search).toBe('')
    expect(window.location.hash).toBe('')
  })
})
