import { describe, it, expect } from 'vitest'
import { encodeTripToUrl, decodeTripFromUrl, decodeShareLink, generateTripUrl, createShareLink, readTripFromUrl, linkIdFor } from './encoding'
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

const withoutIds = (t: Trip | null) =>
  t && {
    ...t,
    members: t.members.map(({ name, role }) => ({ name, role })),
    budget: { ...t.budget, contributions: t.budget.contributions.map(({ amount, currency }) => ({ amount, currency })) },
    itinerary: t.itinerary.map(d => ({ ...d, activities: d.activities.map(({ id: _id, ...a }) => a) })),
  }

const bigTrip: Trip = {
  ...trip,
  members: Array.from({ length: 8 }, (_, i) => ({ id: crypto.randomUUID(), name: `Traveler ${i + 1}`, role: i ? 'member' : 'leader' })),
  itinerary: Array.from({ length: 5 }, (_, d) => ({
    dayNumber: d + 1,
    date: `2026-12-1${d}`,
    activities: Array.from({ length: 4 }, (_, a) => ({ id: crypto.randomUUID(), name: `Stop ${d}-${a}`, description: '', startTime: '09:00', endTime: '' })),
  })),
}

const b64url = (bytes: Uint8Array) => {
  let binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const deflateRaw = async (bytes: Uint8Array<ArrayBuffer>) =>
  new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer())

// The v1 format written by the previous release: "z." + base64url(deflate(JSON)).
const legacyZ = async (t: Trip) => `z.${b64url(await deflateRaw(new TextEncoder().encode(JSON.stringify(t))))}`

describe('share link encoding', () => {
  it('round-trips a trip including Khmer text and emoji', async () => {
    const encoded = await encodeTripToUrl(trip)
    expect(encoded).toMatch(/^e\.[A-Za-z0-9_-]+$/) // encrypted prefix + URL-safe, no padding
    expect(withoutIds(await decodeTripFromUrl(encoded))).toEqual(withoutIds(trip))
  })

  it('keeps contributions attached to the right traveler and the leader', async () => {
    const group: Trip = {
      ...trip,
      members: [
        { id: 'x1', name: 'Dara', role: 'member' },
        { id: 'x2', name: 'Bopha', role: 'leader' },
      ],
      budget: { total: 100, currency: 'USD', contributions: [{ memberId: 'x2', amount: 60, currency: 'USD' }] },
    }
    const decoded = (await decodeTripFromUrl(await encodeTripToUrl(group)))!
    expect(decoded.members.map(m => [m.name, m.role])).toEqual([['Dara', 'member'], ['Bopha', 'leader']])
    expect(decoded.budget.contributions).toEqual([{ memberId: decoded.members[1].id, amount: 60, currency: 'USD' }])
  })

  it('is much shorter than the previous z. format', async () => {
    const encoded = await encodeTripToUrl(bigTrip)
    const v1 = await legacyZ(bigTrip)
    expect(encoded.length).toBeLessThan(v1.length * 0.75)
  })

  it('encrypts: trip text is not readable from the link, and each link uses a new key', async () => {
    const a = await encodeTripToUrl(trip)
    const b = await encodeTripToUrl(trip)
    expect(a).not.toEqual(b)
    expect(atob(a.slice(2).replace(/-/g, '+').replace(/_/g, '/'))).not.toContain('Kampot')
  })

  it('builds a fragment link on the given origin with a link id', async () => {
    expect(await generateTripUrl(trip, 'https://gokh.example')).toMatch(/^https:\/\/gokh\.example\/#e\.[A-Za-z0-9_-]+$/)
    const now = new Date('2026-11-28T03:04:05Z')
    const link = await createShareLink(trip, 'https://gokh.example', now)
    expect(link.id).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/)
    // Receiver sees the same id and creation time as the sender.
    const opened = await readTripFromUrl('', new URL(link.url).hash)
    expect(opened.status === 'loaded' && opened.link).toEqual({ id: link.id, sharedAt: now })
  })

  it('link id is stable for a payload and differs between payloads', async () => {
    expect(await linkIdFor('e.abc')).toBe(await linkIdFor('e.abc'))
    expect(await linkIdFor('e.abc')).not.toBe(await linkIdFor('e.abd'))
  })

  it('rejects a link with a single changed character (integrity check)', async () => {
    const encoded = await encodeTripToUrl(trip)
    const i = encoded.length - 10
    const tampered = encoded.slice(0, i) + (encoded[i] === 'A' ? 'B' : 'A') + encoded.slice(i + 1)
    expect(await decodeTripFromUrl(tampered)).toBeNull()
  })

  it('rejects a decompression bomb instead of inflating it', async () => {
    const bomb = await deflateRaw(new TextEncoder().encode(`{"tripName":"${'a'.repeat(5_000_000)}","destination":""}`))
    expect(bomb.length).toBeLessThan(200_000)
    expect(await decodeTripFromUrl(`z.${b64url(bomb)}`)).toBeNull()
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

  it('reads v2 links from the fragment and ignores unrelated fragments', async () => {
    const encoded = await encodeTripToUrl(trip)
    expect((await readTripFromUrl('', `#${encoded}`)).status).toBe('loaded')
    expect(await readTripFromUrl('', '#share-section')).toEqual({ status: 'none' })
    expect(await readTripFromUrl('', '#e.garbage')).toEqual({ status: 'invalid' })
  })

  it('a truncated link is reported as invalid rather than half-loaded', async () => {
    const encoded = await encodeTripToUrl(trip)
    expect(await readTripFromUrl('', `#${encoded.slice(0, -1)}`)).toEqual({ status: 'invalid' })
    expect(await readTripFromUrl('', `#${encoded.slice(0, encoded.length / 2)}`)).toEqual({ status: 'invalid' })
  })

  it('backward-compat: z. (deflate) links from the previous release still open', async () => {
    const z = await legacyZ(trip)
    const result = await decodeShareLink(z)
    expect(result?.trip).toEqual(trip)
    expect(result?.link.sharedAt).toBeNull()
    expect((await readTripFromUrl(`?trip=${z}`)).status).toBe('loaded')
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
