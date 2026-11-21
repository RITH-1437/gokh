import type {
  Trip,
  Member,
  Contribution,
  ItineraryDay,
  Activity,
  Currency,
  TransportationType,
  AccommodationType
} from '../types/trip'
import { isValidISODate, daysBetweenInclusive, MAX_TRIP_DAYS } from './dates'
import { createId } from './id'
import { MAX_AMOUNT } from './currency'
import { CHECKLIST_IDS } from '../data/essentials'

// Share links and saved drafts are untrusted input: anyone can hand-craft a
// `?trip=` URL. Everything coming from outside the running app passes through
// `sanitizeTrip`, which rebuilds a well-formed Trip (or returns null) so the
// UI never has to defend against missing arrays, wrong types, or huge payloads.

export const LIMITS = {
  tripName: 80,
  destination: 80,
  memberName: 50,
  members: 50,
  note: 200,
  accommodationName: 100,
  activityName: 120,
  activityDescription: 500,
  activitiesPerDay: 50,
  maxAmount: MAX_AMOUNT
} as const

const CURRENCIES: readonly Currency[] = ['USD', 'KHR']
const TRANSPORT_TYPES: readonly TransportationType[] = ['motorcycle', 'van', 'bus']
const ACCOMMODATION_TYPES: readonly AccommodationType[] = ['hotel', 'guesthouse', 'camping']

type Obj = Record<string, unknown>

const isObject = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '')

const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback

const amount = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.min(v, LIMITS.maxAmount) : 0

const time = (v: unknown): string =>
  typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : ''

const id = (v: unknown, seen: Set<string>): string => {
  const candidate = typeof v === 'string' && v.length > 0 && v.length <= 64 ? v : ''
  const result = candidate && !seen.has(candidate) ? candidate : createId()
  seen.add(result)
  return result
}

const sanitizeMembers = (raw: unknown): Member[] => {
  if (!Array.isArray(raw)) return []
  const seenIds = new Set<string>()
  const seenNames = new Set<string>()
  const members: Member[] = []

  for (const m of raw) {
    if (members.length >= LIMITS.members) break
    if (!isObject(m)) continue
    const name = str(m.name, LIMITS.memberName).trim()
    if (!name || seenNames.has(name.toLowerCase())) continue
    seenNames.add(name.toLowerCase())
    members.push({ id: id(m.id, seenIds), name, role: m.role === 'leader' ? 'leader' : 'member' })
  }

  // Exactly one leader whenever there is at least one member.
  const leaderIndex = members.findIndex(m => m.role === 'leader')
  members.forEach((m, i) => {
    m.role = i === (leaderIndex === -1 ? 0 : leaderIndex) ? 'leader' : 'member'
  })
  return members
}

const sanitizeContributions = (raw: unknown, members: Member[]): Contribution[] => {
  if (!Array.isArray(raw)) return []
  const memberIds = new Set(members.map(m => m.id))
  const used = new Set<string>()
  const result: Contribution[] = []
  for (const c of raw) {
    if (!isObject(c) || typeof c.memberId !== 'string') continue
    if (!memberIds.has(c.memberId) || used.has(c.memberId)) continue
    used.add(c.memberId)
    result.push({ memberId: c.memberId, amount: amount(c.amount), currency: oneOf(c.currency, CURRENCIES, 'USD') })
  }
  return result
}

const sanitizeActivities = (raw: unknown, seenIds: Set<string>): Activity[] => {
  if (!Array.isArray(raw)) return []
  const result: Activity[] = []
  for (const a of raw) {
    if (result.length >= LIMITS.activitiesPerDay) break
    if (!isObject(a)) continue
    const name = str(a.name, LIMITS.activityName).trim()
    if (!name) continue
    result.push({
      id: id(a.id, seenIds),
      name,
      description: str(a.description, LIMITS.activityDescription),
      startTime: time(a.startTime),
      endTime: time(a.endTime)
    })
  }
  return result
}

const sanitizeItinerary = (raw: unknown): ItineraryDay[] => {
  if (!Array.isArray(raw)) return []
  const seenIds = new Set<string>()
  return raw.slice(0, MAX_TRIP_DAYS).map((d, index) => {
    const day = isObject(d) ? d : {}
    return {
      dayNumber: index + 1,
      date: isValidISODate(day.date) ? day.date : '',
      activities: sanitizeActivities(day.activities, seenIds)
    }
  })
}

export const sanitizeTrip = (data: unknown): Trip | null => {
  if (!isObject(data)) return null
  // Minimum shape every GoKH trip has always had; anything else is not a trip.
  if (typeof data.tripName !== 'string' || typeof data.destination !== 'string') return null

  const startDate = isValidISODate(data.startDate) ? data.startDate : ''
  let endDate = isValidISODate(data.endDate) ? data.endDate : ''
  if (startDate && endDate) {
    const days = daysBetweenInclusive(startDate, endDate)
    if (days < 1 || days > MAX_TRIP_DAYS) endDate = ''
  }

  const members = sanitizeMembers(data.members)
  const transportation = isObject(data.transportation) ? data.transportation : {}
  const accommodation = isObject(data.accommodation) ? data.accommodation : {}
  const budget = isObject(data.budget) ? data.budget : {}

  return {
    tripName: str(data.tripName, LIMITS.tripName),
    destination: str(data.destination, LIMITS.destination),
    members,
    startDate,
    endDate,
    transportation: {
      type: oneOf(transportation.type, TRANSPORT_TYPES, 'motorcycle'),
      note: str(transportation.note, LIMITS.note)
    },
    accommodation: {
      type: oneOf(accommodation.type, ACCOMMODATION_TYPES, 'hotel'),
      name: str(accommodation.name, LIMITS.accommodationName)
    },
    budget: {
      total: amount(budget.total),
      currency: oneOf(budget.currency, CURRENCIES, 'USD'),
      contributions: sanitizeContributions(budget.contributions, members)
    },
    itinerary: sanitizeItinerary(data.itinerary),
    checklist: Array.isArray(data.checklist)
      ? CHECKLIST_IDS.filter(id => (data.checklist as unknown[]).includes(id))
      : []
  }
}
