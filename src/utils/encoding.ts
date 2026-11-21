import type { Trip } from '../types/trip'
import { sanitizeTrip } from './tripSchema'

// Share links over this size are rejected before decoding (defence against
// pathological URLs; a realistic 10-day, 10-traveler trip is ~5-10 KB).
const MAX_ENCODED_LENGTH = 200_000

// Compress JSON data to make URL shorter
const compressData = (data: unknown): string => {
  try {
    const jsonString = JSON.stringify(data)
    // Encode as UTF-8 first so emoji/non-Latin chars survive base64
    const bytes = new TextEncoder().encode(jsonString)
    let binary = ''
    bytes.forEach((b) => (binary += String.fromCharCode(b)))
    const base64 = btoa(binary)
    // Make it URL-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch (error) {
    console.error('Error compressing data:', error)
    return ''
  }
}

// Decompress JSON data from URL
const decompressData = (compressed: string): unknown => {
  try {
    if (compressed.length > MAX_ENCODED_LENGTH) return null
    // Convert back from URL-safe base64
    const base64 = compressed.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const jsonString = new TextDecoder().decode(bytes)
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error decompressing data:', error)
    return null
  }
}

export const encodeTripToUrl = (trip: Trip): string => {
  const compressed = compressData(trip)
  return compressed
}

// Decode + sanitize. Returns null when the link is not a usable trip.
export const decodeTripFromUrl = (encoded: string): Trip | null => {
  const data = decompressData(encoded)
  if (data == null) return null
  return sanitizeTrip(data)
}

export const generateTripUrl = (trip: Trip, baseUrl: string = window.location.origin): string => {
  const encoded = encodeTripToUrl(trip)
  if (!encoded) throw new Error('Could not encode trip for sharing')
  return `${baseUrl}/?trip=${encoded}`
}

export type UrlTripResult =
  | { status: 'none' }
  | { status: 'invalid' }
  | { status: 'loaded'; trip: Trip }

// Distinguishes "no shared trip in the URL" from "a broken link" so the UI
// can tell the user instead of silently showing an empty planner.
export const readTripFromUrl = (search: string = window.location.search): UrlTripResult => {
  const encodedTrip = new URLSearchParams(search).get('trip')
  if (!encodedTrip) return { status: 'none' }
  const trip = decodeTripFromUrl(encodedTrip)
  return trip ? { status: 'loaded', trip } : { status: 'invalid' }
}

export const extractTripFromUrl = (): Trip | null => {
  const result = readTripFromUrl()
  return result.status === 'loaded' ? result.trip : null
}
