import { isValidISODate, parseISODate } from './dates'
import { createId } from './id'

// Decoder for the positional trip form inside v2 ("e.") share links.
// v2 links are no longer written (see tripBinary.ts for v3) but links already
// sent to people must keep opening, so this stays — decode only.
//
// Plain JSON repeats every key ("description", "startTime"…) and carries a
// 36-char UUID for every traveler and activity. None of that is needed to
// rebuild a trip: ids are regenerated on load, contributions point at a
// traveler by index, and itinerary dates are consecutive from the first day.
// Packing typically halves the link before compression even starts.
//
// The output of `unpackTrip` is still untrusted and MUST go through
// `sanitizeTrip` — this file only reshapes data, it validates nothing.

export const PACK_VERSION = 1

type PackedActivity = string[] // [name, description?, startTime?, endTime?]
type PackedContribution = [number, number, string] // [memberIndex, amount, currency]

export type PackedTrip = [
  version: number,
  sharedAt: number, // unix seconds
  tripName: string,
  destination: string,
  startDate: string,
  endDate: string,
  members: string[],
  leaderIndex: number,
  transport: [type: string, note: string],
  accommodation: [type: string, name: string],
  budget: [total: number, currency: string, contributions: PackedContribution[]],
  firstDay: string,
  days: PackedActivity[][],
  checklist: string[],
]

const pad = (n: number) => String(n).padStart(2, '0')

const addDaysISO = (iso: string, days: number): string => {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export interface UnpackedTrip {
  /** Trip-shaped but unvalidated — pass to `sanitizeTrip`. */
  raw: Record<string, unknown>
  sharedAt: Date | null
}

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const at = (v: unknown, i: number): unknown => arr(v)[i]

/** Reverse of `packTrip`. Returns null if the value is not a packed trip. */
export const unpackTrip = (packed: unknown): UnpackedTrip | null => {
  if (!Array.isArray(packed) || packed[0] !== PACK_VERSION) return null
  const [, sharedAtRaw, tripName, destination, startDate, endDate, names, leader, transport, stay, budget, firstDay, days, checklist] = packed

  const members = arr(names).map((name, i) => ({
    id: createId(),
    name,
    role: i === leader ? 'leader' : 'member',
  }))

  const contributions = arr(at(budget, 2)).map(c => ({
    memberId: typeof at(c, 0) === 'number' ? members[at(c, 0) as number]?.id : undefined,
    amount: at(c, 1),
    currency: at(c, 2),
  }))

  const start = isValidISODate(firstDay) ? firstDay : ''
  const itinerary = arr(days).map((day, i) => ({
    date: start ? addDaysISO(start, i) : '',
    activities: arr(day).map(a => ({
      name: at(a, 0),
      description: at(a, 1) ?? '',
      startTime: at(a, 2) ?? '',
      endTime: at(a, 3) ?? '',
    })),
  }))

  const seconds = typeof sharedAtRaw === 'number' && Number.isFinite(sharedAtRaw) ? sharedAtRaw : NaN
  const sharedAt = seconds > 0 ? new Date(seconds * 1000) : null

  return {
    raw: {
      tripName,
      destination,
      startDate,
      endDate,
      members,
      transportation: { type: at(transport, 0), note: at(transport, 1) ?? '' },
      accommodation: { type: at(stay, 0), name: at(stay, 1) ?? '' },
      budget: { total: at(budget, 0), currency: at(budget, 1), contributions },
      itinerary,
      checklist,
    },
    sharedAt: sharedAt && !isNaN(sharedAt.getTime()) ? sharedAt : null,
  }
}
