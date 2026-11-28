import type { Trip } from '../types/trip'
import { SHARE_CHECKLIST, SHARE_DICTIONARY, SHARE_DICTIONARY_CAPACITY } from './shareDictionary'

// Binary trip form used inside v3 ("f.") share links.
//
// Every number is an unsigned LEB128 varint (1 byte below 128). Text is one
// "text token" varint:
//   0                  → empty string
//   1 … CAPACITY       → SHARE_DICTIONARY[token − 1]   (catalog phrase; the most
//                        used activities are first, so they cost 1 byte)
//   CAPACITY + len     → `len` UTF-8 bytes follow     (anything the user typed)
//
// Dates are day numbers: the start date counts from 2026-01-01, end date and
// first itinerary day count from the start date (usually 1 byte). Each is
// stored as zigzag(n) + 1, with 0 meaning "empty".
//
// Layout, in order:
//   sharedAt     minutes since 2026-01-01 UTC
//   tripName, destination                text
//   startDate, endDate, firstItineraryDay date
//   members      count, name text each, then leader index
//   transport    enum index, note text
//   stay         enum index, name text
//   budget       amount, currency index, count, then [member index, amount, currency] each
//   itinerary    day count; per day: activityCount·2 + hasDetails; per activity:
//                  name text, and only when hasDetails: flags (1 = description,
//                  2 = start, 4 = end) followed by the flagged fields
//                  (times are minutes since midnight + 1)
//   checklist    bitmask over SHARE_CHECKLIST
//
// Amounts: whole numbers as 2·n, anything else as 2·cents + 1.
//
// The output of `readTripBinary` is untrusted and MUST go through
// `sanitizeTrip`; this file only checks that the bytes are well formed.

// Frozen enum orders: append only, never reorder (old links store the index).
const TRANSPORT = ['motorcycle', 'van', 'bus'] as const
const STAY = ['hotel', 'guesthouse', 'camping'] as const
const CURRENCY = ['USD', 'KHR'] as const

const EPOCH_MINUTES = Date.UTC(2026, 0, 1) / 60_000
const EPOCH_DAY = Date.UTC(2026, 0, 1) / 86_400_000
const MAX_LITERAL_BYTES = 2_000

const dictionaryIndex = new Map(SHARE_DICTIONARY.map((phrase, i) => [phrase, i]))
const utf8 = new TextEncoder()
const fromUtf8 = new TextDecoder('utf-8', { fatal: true })

const zigzag = (n: number) => (n >= 0 ? n * 2 : -n * 2 - 1)
const unzigzag = (n: number) => (n % 2 === 0 ? n / 2 : -(n + 1) / 2)
const pad = (n: number) => String(n).padStart(2, '0')

/** Absolute day number (since 2026-01-01) of a YYYY-MM-DD string, or null. */
const dayNumber = (iso: string | undefined): number | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86_400_000 - EPOCH_DAY : null
}

const isoFromDay = (day: number): string => {
  const d = new Date((day + EPOCH_DAY) * 86_400_000)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

class Writer {
  private bytes: number[] = []

  uint(value: number) {
    let n = Number.isSafeInteger(value) && value > 0 ? value : 0
    while (n >= 0x80) {
      this.bytes.push((n % 0x80) | 0x80)
      n = Math.floor(n / 0x80)
    }
    this.bytes.push(n)
  }

  text(value: string | undefined) {
    const s = value ?? ''
    if (!s) return this.uint(0)
    const i = dictionaryIndex.get(s)
    if (i !== undefined) return this.uint(i + 1)
    const raw = utf8.encode(s)
    this.uint(SHARE_DICTIONARY_CAPACITY + raw.length)
    raw.forEach(b => this.bytes.push(b))
  }

  /** Day number relative to `base` (null base = absolute). */
  date(day: number | null, base: number | null = null) {
    this.uint(day === null ? 0 : zigzag(day - (base ?? 0)) + 1)
  }

  time(hhmm: string | undefined) {
    const m = /^(\d{2}):(\d{2})$/.exec(hhmm ?? '')
    this.uint(m ? +m[1] * 60 + +m[2] + 1 : 0)
  }

  amount(value: number) {
    const n = Number.isFinite(value) && value > 0 ? value : 0
    if (Number.isInteger(n)) this.uint(n * 2)
    else this.uint(Math.round(n * 100) * 2 + 1)
  }

  index(list: readonly string[], value: string) {
    this.uint(Math.max(0, list.indexOf(value)))
  }

  result() {
    return new Uint8Array(this.bytes)
  }
}

class Reader {
  private pos = 0
  constructor(private bytes: Uint8Array) {}

  uint(): number {
    let result = 0
    let scale = 1
    for (let i = 0; i < 8; i++) {
      if (this.pos >= this.bytes.length) throw new Error('Unexpected end of share link')
      const b = this.bytes[this.pos++]
      result += (b & 0x7f) * scale
      if (b < 0x80) return result
      scale *= 0x80
    }
    throw new Error('Number too long in share link')
  }

  /** A count of items that each take at least one byte, so it can't exceed what's left. */
  count(): number {
    const n = this.uint()
    if (n > this.bytes.length - this.pos) throw new Error('Bad count in share link')
    return n
  }

  text(): string {
    const token = this.uint()
    if (token === 0) return ''
    if (token <= SHARE_DICTIONARY_CAPACITY) {
      const phrase = SHARE_DICTIONARY[token - 1]
      if (phrase === undefined) throw new Error('Unknown phrase in share link')
      return phrase
    }
    const length = token - SHARE_DICTIONARY_CAPACITY
    if (length > MAX_LITERAL_BYTES || this.pos + length > this.bytes.length) throw new Error('Bad text in share link')
    const s = fromUtf8.decode(this.bytes.subarray(this.pos, this.pos + length))
    this.pos += length
    return s
  }

  date(base: number | null = null): number | null {
    const n = this.uint()
    if (n === 0) return null
    const day = unzigzag(n - 1) + (base ?? 0)
    if (Math.abs(day) > 400_000) throw new Error('Bad date in share link')
    return day
  }

  time(): string {
    const n = this.uint()
    if (n > 24 * 60) throw new Error('Bad time in share link')
    return n === 0 ? '' : `${pad(Math.floor((n - 1) / 60))}:${pad((n - 1) % 60)}`
  }

  amount(): number {
    const n = this.uint()
    return n % 2 === 0 ? n / 2 : (n - 1) / 2 / 100
  }

  index<T extends string>(list: readonly T[]): T | '' {
    return list[this.uint()] ?? ''
  }

  done() {
    if (this.pos !== this.bytes.length) throw new Error('Trailing bytes in share link')
  }
}

export const writeTripBinary = (trip: Trip, sharedAt: Date = new Date()): Uint8Array => {
  const w = new Writer()
  w.uint(Math.round(sharedAt.getTime() / 60_000 - EPOCH_MINUTES))
  w.text(trip.tripName)
  w.text(trip.destination)
  const start = dayNumber(trip.startDate)
  w.date(start)
  w.date(dayNumber(trip.endDate), start)
  w.date(dayNumber(trip.itinerary[0]?.date), start)

  w.uint(trip.members.length)
  trip.members.forEach(m => w.text(m.name))
  w.uint(Math.max(0, trip.members.findIndex(m => m.role === 'leader')))

  w.index(TRANSPORT, trip.transportation.type)
  w.text(trip.transportation.note)
  w.index(STAY, trip.accommodation.type)
  w.text(trip.accommodation.name)

  const memberIndex = new Map(trip.members.map((m, i) => [m.id, i]))
  const contributions = trip.budget.contributions.filter(c => memberIndex.has(c.memberId))
  w.amount(trip.budget.total)
  w.index(CURRENCY, trip.budget.currency)
  w.uint(contributions.length)
  contributions.forEach(c => {
    w.uint(memberIndex.get(c.memberId)!)
    w.amount(c.amount)
    w.index(CURRENCY, c.currency)
  })

  w.uint(trip.itinerary.length)
  trip.itinerary.forEach(day => {
    const flagsOf = (a: (typeof day.activities)[number]) =>
      (a.description ? 1 : 0) | (a.startTime ? 2 : 0) | (a.endTime ? 4 : 0)
    const hasDetails = day.activities.some(a => flagsOf(a) !== 0)
    w.uint(day.activities.length * 2 + (hasDetails ? 1 : 0))
    day.activities.forEach(a => {
      w.text(a.name)
      if (!hasDetails) return
      const flags = flagsOf(a)
      w.uint(flags)
      if (flags & 1) w.text(a.description)
      if (flags & 2) w.time(a.startTime)
      if (flags & 4) w.time(a.endTime)
    })
  })

  const done = new Set(trip.checklist ?? [])
  w.uint(SHARE_CHECKLIST.reduce((mask, id, bit) => (done.has(id) ? mask + 2 ** bit : mask), 0))
  return w.result()
}

export interface BinaryTrip {
  /** Trip-shaped but unvalidated: pass to `sanitizeTrip`. */
  raw: Record<string, unknown>
  sharedAt: Date
}

export const readTripBinary = (bytes: Uint8Array): BinaryTrip => {
  const r = new Reader(bytes)
  const sharedAt = new Date((r.uint() + EPOCH_MINUTES) * 60_000)
  const tripName = r.text()
  const destination = r.text()
  const start = r.date()
  const end = r.date(start)
  const firstDay = r.date(start)

  const names = Array.from({ length: r.count() }, () => r.text())
  const leader = r.uint()
  // Ids are placeholders; sanitizeTrip keeps them so contributions still match.
  const members = names.map((name, i) => ({ id: `m${i}`, name, role: i === leader ? 'leader' : 'member' }))

  const transportation = { type: r.index(TRANSPORT), note: r.text() }
  const accommodation = { type: r.index(STAY), name: r.text() }

  const total = r.amount()
  const currency = r.index(CURRENCY)
  const contributions = Array.from({ length: r.count() }, () => ({
    memberId: members[r.uint()]?.id,
    amount: r.amount(),
    currency: r.index(CURRENCY),
  }))

  const itinerary = Array.from({ length: r.count() }, (_, i) => {
    const head = r.uint()
    const hasDetails = head % 2 === 1
    const count = (head - (head % 2)) / 2
    if (count > bytes.length) throw new Error('Bad count in share link')
    return {
      date: firstDay === null ? '' : isoFromDay(firstDay + i),
      activities: Array.from({ length: count }, () => {
        const name = r.text()
        const flags = hasDetails ? r.uint() : 0
        return {
          name,
          description: flags & 1 ? r.text() : '',
          startTime: flags & 2 ? r.time() : '',
          endTime: flags & 4 ? r.time() : '',
        }
      }),
    }
  })

  const mask = r.uint()
  const checklist = SHARE_CHECKLIST.filter((_, bit) => Math.floor(mask / 2 ** bit) % 2 === 1)
  r.done()

  return {
    raw: {
      tripName,
      destination,
      startDate: start === null ? '' : isoFromDay(start),
      endDate: end === null ? '' : isoFromDay(end),
      members,
      transportation,
      accommodation,
      budget: { total, currency, contributions },
      itinerary,
      checklist,
    },
    sharedAt,
  }
}
