import type { Trip } from '../types/trip'
import { sanitizeTrip } from './tripSchema'

// Share links over this size are rejected before decoding (defence against
// pathological URLs; a realistic 10-day, 10-traveler trip is ~5-10 KB).
const MAX_ENCODED_LENGTH = 200_000

// Version prefix written into every new share link so the decoder knows which
// path to take. Legacy links (no prefix) are still accepted by the decoder.
const COMPRESSED_PREFIX = 'z.'

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Convert raw bytes to URL-safe base64 (no padding). */
const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Decode URL-safe base64 (with or without padding) to raw bytes. */
const base64UrlToBytes = (b64: string): Uint8Array => {
  const standard = b64.replace(/-/g, '+').replace(/_/g, '/')
  const padded = standard + '='.repeat((4 - (standard.length % 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

// ─── DEFLATE compress / decompress (native Web API, no extra deps) ────────────

const deflateCompress = async (data: unknown): Promise<string> => {
  const json = JSON.stringify(data)
  const input = new TextEncoder().encode(json)

  const cs = new CompressionStream('deflate-raw')
  const writer = cs.writable.getWriter()
  writer.write(input)
  writer.close()

  const chunks: Uint8Array[] = []
  const reader = cs.readable.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const totalLength = chunks.reduce((n, c) => n + c.length, 0)
  const compressed = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    compressed.set(chunk, offset)
    offset += chunk.length
  }

  return COMPRESSED_PREFIX + bytesToBase64Url(compressed)
}

const deflateDecompress = async (payload: string): Promise<unknown> => {
  const bytes = base64UrlToBytes(payload)

  const ds = new DecompressionStream('deflate-raw')

  // Write and close in a separate microtask chain so stream errors don't
  // escape the try/catch as unhandled rejections on some runtimes (Node.js).
  const writePromise = (async () => {
    const writer = ds.writable.getWriter()
    await writer.write(bytes)
    await writer.close()
  })()

  const chunks: Uint8Array[] = []
  const reader = ds.readable.getReader()
  const readPromise = (async () => {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
  })()

  // Await both together so errors from either side are caught by the caller.
  await Promise.all([writePromise, readPromise])

  const totalLength = chunks.reduce((n, c) => n + c.length, 0)
  const decompressed = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    decompressed.set(chunk, offset)
    offset += chunk.length
  }

  return JSON.parse(new TextDecoder().decode(decompressed))
}

// ─── Legacy path (plain base64, kept for backward-compat decode only) ─────────

const legacyDecompress = (compressed: string): unknown => {
  const base64 = compressed.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Encode a trip to a URL-safe, DEFLATE-compressed string. Async because the
 *  Web Compression API is stream-based. */
export const encodeTripToUrl = async (trip: Trip): Promise<string> => {
  try {
    return await deflateCompress(trip)
  } catch (error) {
    console.error('Error encoding trip:', error)
    return ''
  }
}

/** Decode + sanitize. Returns null when the link is not a usable trip. */
export const decodeTripFromUrl = async (encoded: string): Promise<Trip | null> => {
  try {
    if (encoded.length > MAX_ENCODED_LENGTH) return null

    let raw: unknown

    if (encoded.startsWith(COMPRESSED_PREFIX)) {
      // New format: deflate-compressed
      const payload = encoded.slice(COMPRESSED_PREFIX.length)
      raw = await deflateDecompress(payload)
    } else {
      // Legacy format: plain base64 — keep old links working
      raw = legacyDecompress(encoded)
    }

    return sanitizeTrip(raw)
  } catch (error) {
    console.error('Error decoding trip:', error)
    return null
  }
}

export const generateTripUrl = async (
  trip: Trip,
  baseUrl: string = window.location.origin,
): Promise<string> => {
  const encoded = await encodeTripToUrl(trip)
  if (!encoded) throw new Error('Could not encode trip for sharing')
  return `${baseUrl}/?trip=${encoded}`
}

export type UrlTripResult =
  | { status: 'none' }
  | { status: 'invalid' }
  | { status: 'loaded'; trip: Trip }

/** Distinguishes "no shared trip in the URL" from "a broken link" so the UI
 *  can tell the user instead of silently showing an empty planner. */
export const readTripFromUrl = async (
  search: string = window.location.search,
): Promise<UrlTripResult> => {
  const encodedTrip = new URLSearchParams(search).get('trip')
  if (!encodedTrip) return { status: 'none' }
  const trip = await decodeTripFromUrl(encodedTrip)
  return trip ? { status: 'loaded', trip } : { status: 'invalid' }
}

export const extractTripFromUrl = async (): Promise<Trip | null> => {
  const result = await readTripFromUrl()
  return result.status === 'loaded' ? result.trip : null
}
