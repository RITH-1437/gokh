import type { Trip } from '../types/trip'
import { sanitizeTrip } from './tripSchema'
import { unpackTrip } from './tripPack'
import { readTripBinary, writeTripBinary } from './tripBinary'

// ─── Share-link formats ──────────────────────────────────────────────────────
//
//   v3  https://<origin>/#f.<payload>       (current, written by the app)
//       payload = base64url( key[16] ‖ AES-GCM-64( mode ‖ body ) )
//       body    = writeTripBinary(trip), or deflate of it when that is smaller (mode 1)
//   v2  https://<origin>/#e.<payload>       (decode only)
//       payload = base64url( key[16] ‖ AES-GCM( deflate( JSON(packTrip) ) ) )
//   v1  https://<origin>/?trip=z.<payload>  (decode only)
//       payload = base64url( deflate( JSON(trip) ) )
//   v0  https://<origin>/?trip=<payload>    (decode only)
//       payload = base64url( JSON(trip) )
//
// v2/v3 live in the URL *fragment*, which browsers never send to a server, so the
// trip is not written to hosting logs or fetched by chat link-preview bots.
// It is encrypted with a fresh random 128-bit key carried inside the link:
// anyone holding the full link can open it (that is the point of sharing), but
// a truncated, edited or corrupted link fails the AES-GCM integrity check and is
// reported as broken instead of loading half a trip.
//
// Every decoded payload, whatever the version, still passes through
// `sanitizeTrip` — decryption proves integrity, not trustworthiness.

const MAX_ENCODED_LENGTH = 200_000
// Cap on inflated size: stops a small "zip bomb" link from allocating hundreds
// of MB. Far above any trip sanitizeTrip would accept.
const MAX_DECODED_BYTES = 4_000_000

const COMPACT_PREFIX = 'f.'
const ENCRYPTED_PREFIX = 'e.'
const COMPRESSED_PREFIX = 'z.'
const KEY_BYTES = 16
const GCM_TAG_BYTES = 16
// v3 uses a 64-bit tag: still a 1-in-18-quintillion chance that a damaged link
// slips through, and 11 characters shorter. (The tag is for integrity — anyone
// with the link has the key anyway.)
const COMPACT_TAG_BITS = 64
const MODE_RAW = 0
const MODE_DEFLATE = 1
// A fixed IV is safe here because every link uses a brand-new random key, so a
// (key, IV) pair is never reused. It saves 16 characters per link.
const IV = new Uint8Array(12)

export interface ShareLinkInfo {
  /** Short fingerprint of this exact link, e.g. "K7QX-2M9P". Same for sender and receiver. */
  id: string
  /** When the link was created (v2 links only). */
  sharedAt: Date | null
}

export interface ShareLink extends ShareLinkInfo {
  url: string
}

// ─── byte helpers ────────────────────────────────────────────────────────────

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const base64UrlToBytes = (b64: string): Uint8Array<ArrayBuffer> => {
  if (!/^[A-Za-z0-9_-]*$/.test(b64)) throw new Error('Invalid base64url')
  const standard = b64.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(standard + '='.repeat((4 - (standard.length % 4)) % 4))
  return Uint8Array.from(binary, c => c.charCodeAt(0))
}

const concat = (chunks: Uint8Array[]): Uint8Array<ArrayBuffer> => {
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

/** Pipe bytes through a (de)compression stream, aborting past `maxBytes`. */
const transform = async (
  stream: CompressionStream | DecompressionStream,
  input: Uint8Array<ArrayBuffer>,
  maxBytes = Infinity,
): Promise<Uint8Array<ArrayBuffer>> => {
  const writer = stream.writable.getWriter()
  const reader = stream.readable.getReader()
  // Write and read concurrently and await both, so an error on either side is
  // caught by the caller instead of escaping as an unhandled rejection.
  const write = (async () => {
    await writer.write(input)
    await writer.close()
  })()
  const read = (async () => {
    const chunks: Uint8Array[] = []
    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) return concat(chunks)
      total += value.length
      if (total > maxBytes) {
        await reader.cancel()
        throw new Error('Share link payload too large')
      }
      chunks.push(value)
    }
  })()
  const [, out] = await Promise.all([write, read])
  return out
}

const deflate = (bytes: Uint8Array<ArrayBuffer>) => transform(new CompressionStream('deflate-raw'), bytes)
const inflate = (bytes: Uint8Array<ArrayBuffer>) =>
  transform(new DecompressionStream('deflate-raw'), bytes, MAX_DECODED_BYTES)

const importKey = (raw: Uint8Array<ArrayBuffer>, usage: KeyUsage) =>
  crypto.subtle.importKey('raw', raw, 'AES-GCM', false, [usage])

// Crockford base32 (no I, L, O, U) — easy to read aloud or compare by eye.
const ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/** 8-character fingerprint of a link payload (40 bits of SHA-256). */
export const linkIdFor = async (payload: string): Promise<string> => {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload)))
  // 40 bits fits exactly in a JS number, so no BigInt needed.
  let bits = 0
  for (let i = 0; i < 5; i++) bits = bits * 256 + hash[i]
  let id = ''
  for (let i = 0; i < 8; i++) {
    id = ID_ALPHABET[bits % 32] + id
    bits = Math.floor(bits / 32)
  }
  return `${id.slice(0, 4)}-${id.slice(4)}`
}

// ─── v3: binary + catalog phrases + encrypted (current) ─────────────────────

const encodeV3 = async (trip: Trip, now: Date): Promise<string> => {
  const body = concat([writeTripBinary(trip, now)])
  const deflated = await deflate(body)
  const plain = deflated.length < body.length
    ? concat([Uint8Array.of(MODE_DEFLATE), deflated])
    : concat([Uint8Array.of(MODE_RAW), body])
  const key = crypto.getRandomValues(new Uint8Array(KEY_BYTES))
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: IV, tagLength: COMPACT_TAG_BITS },
    await importKey(key, 'encrypt'),
    plain,
  )
  return COMPACT_PREFIX + bytesToBase64Url(concat([key, new Uint8Array(cipher)]))
}

const decodeV3 = async (payload: string): Promise<{ raw: unknown; sharedAt: Date | null }> => {
  const bytes = base64UrlToBytes(payload)
  if (bytes.length < KEY_BYTES + COMPACT_TAG_BITS / 8 + 1) throw new Error('Share link too short')
  const key = await importKey(bytes.slice(0, KEY_BYTES), 'decrypt')
  const plain = new Uint8Array(
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv: IV, tagLength: COMPACT_TAG_BITS }, key, bytes.slice(KEY_BYTES)),
  )
  const body = plain.slice(1)
  if (plain[0] === MODE_RAW) return readTripBinary(body)
  if (plain[0] === MODE_DEFLATE) return readTripBinary(await inflate(body))
  throw new Error('Unknown share link mode')
}

// ─── v2: packed JSON + compressed + encrypted (decode only) ─────────────────

const decodeV2 = async (payload: string): Promise<{ raw: unknown; sharedAt: Date | null }> => {
  const bytes = base64UrlToBytes(payload)
  if (bytes.length < KEY_BYTES + GCM_TAG_BYTES) throw new Error('Share link too short')
  const key = await importKey(bytes.slice(0, KEY_BYTES), 'decrypt')
  // Throws if a single byte was changed or the link was cut off.
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: IV }, key, bytes.slice(KEY_BYTES))
  const json = new TextDecoder().decode(await inflate(new Uint8Array(plain)))
  const unpacked = unpackTrip(JSON.parse(json))
  if (!unpacked) throw new Error('Unknown share link version')
  return unpacked
}

// ─── v1 / v0: legacy, decode only — old links must keep working ─────────────

const decodeV1 = async (payload: string): Promise<unknown> =>
  JSON.parse(new TextDecoder().decode(await inflate(base64UrlToBytes(payload))))

const decodeV0 = (payload: string): unknown => JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)))

// ─── Public API ──────────────────────────────────────────────────────────────

/** Encode a trip to a v3 link payload (`f.…`). Returns '' on failure. */
export const encodeTripToUrl = async (trip: Trip, now: Date = new Date()): Promise<string> => {
  try {
    return await encodeV3(trip, now)
  } catch (error) {
    console.error('Error encoding trip:', error)
    return ''
  }
}

/** Decode + sanitize any link payload version. Null when it is not a usable trip. */
export const decodeShareLink = async (encoded: string): Promise<{ trip: Trip; link: ShareLinkInfo } | null> => {
  try {
    if (!encoded || encoded.length > MAX_ENCODED_LENGTH) return null

    let raw: unknown
    let sharedAt: Date | null = null
    if (encoded.startsWith(COMPACT_PREFIX)) {
      ;({ raw, sharedAt } = await decodeV3(encoded.slice(COMPACT_PREFIX.length)))
    } else if (encoded.startsWith(ENCRYPTED_PREFIX)) {
      ;({ raw, sharedAt } = await decodeV2(encoded.slice(ENCRYPTED_PREFIX.length)))
    } else if (encoded.startsWith(COMPRESSED_PREFIX)) {
      raw = await decodeV1(encoded.slice(COMPRESSED_PREFIX.length))
    } else {
      raw = decodeV0(encoded)
    }

    const trip = sanitizeTrip(raw)
    if (!trip) return null
    return { trip, link: { id: await linkIdFor(encoded), sharedAt } }
  } catch (error) {
    console.error('Error decoding trip:', error)
    return null
  }
}

export const decodeTripFromUrl = async (encoded: string): Promise<Trip | null> =>
  (await decodeShareLink(encoded))?.trip ?? null

/** Build a share link once; the returned id lets sender and receivers confirm they hold the same link. */
export const createShareLink = async (
  trip: Trip,
  baseUrl: string = window.location.origin,
  now: Date = new Date(),
): Promise<ShareLink> => {
  const encoded = await encodeTripToUrl(trip, now)
  if (!encoded) throw new Error('Could not encode trip for sharing')
  return { url: `${baseUrl}/#${encoded}`, id: await linkIdFor(encoded), sharedAt: now }
}

export const generateTripUrl = async (trip: Trip, baseUrl: string = window.location.origin): Promise<string> =>
  (await createShareLink(trip, baseUrl)).url

export type UrlTripResult =
  | { status: 'none' }
  | { status: 'invalid' }
  | { status: 'loaded'; trip: Trip; link: ShareLinkInfo }

/** True for a URL fragment that carries a share link (`#f.…` / `#e.…`). */
export const isShareFragment = (hash: string): boolean => {
  const fragment = hash.replace(/^#/, '')
  return fragment.startsWith(COMPACT_PREFIX) || fragment.startsWith(ENCRYPTED_PREFIX)
}

/** Find a link payload in the fragment (v3/v2) or `?trip=…` (v1/v0, and any version for safety). */
const findPayload = (search: string, hash: string): string | null => {
  if (isShareFragment(hash)) return hash.replace(/^#/, '')
  return new URLSearchParams(search).get('trip') || null
}

/** Distinguishes "no shared trip in the URL" from "a broken link" so the UI
 *  can tell the user instead of silently showing an empty planner. */
export const readTripFromUrl = async (
  search: string = window.location.search,
  hash: string = window.location.hash,
): Promise<UrlTripResult> => {
  const payload = findPayload(search, hash)
  if (!payload) return { status: 'none' }
  const result = await decodeShareLink(payload)
  return result ? { status: 'loaded', ...result } : { status: 'invalid' }
}

export const extractTripFromUrl = async (): Promise<Trip | null> => {
  const result = await readTripFromUrl()
  return result.status === 'loaded' ? result.trip : null
}
