import type { Trip } from '../types/trip'

// Compress JSON data to make URL shorter
const compressData = (data: any): string => {
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
const decompressData = (compressed: string): any => {
  try {
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

export const decodeTripFromUrl = (encoded: string): Trip | null => {
  const data = decompressData(encoded)
  if (!data) return null
  
  // Validate the decoded data
  if (!validateTripData(data)) {
    return null
  }
  
  return data as Trip
}

const validateTripData = (data: any): boolean => {
  // Basic shape validation (values may be empty — trips can be shared partially built)
  if (!data || typeof data !== 'object') return false
  if (typeof data.tripName !== 'string') return false
  if (typeof data.destination !== 'string') return false
  if (typeof data.startDate !== 'string') return false
  if (typeof data.endDate !== 'string') return false
  if (!Array.isArray(data.members)) return false
  if (!data.transportation || typeof data.transportation !== 'object') return false
  if (!data.accommodation || typeof data.accommodation !== 'object') return false
  if (!data.budget || typeof data.budget !== 'object') return false
  if (!Array.isArray(data.itinerary)) return false

  return true
}

export const generateTripUrl = (trip: Trip, baseUrl: string = window.location.origin): string => {
  const encoded = encodeTripToUrl(trip)
  return `${baseUrl}/?trip=${encoded}`
}

export const extractTripFromUrl = (): Trip | null => {
  const urlParams = new URLSearchParams(window.location.search)
  const encodedTrip = urlParams.get('trip')
  
  if (!encodedTrip) return null
  
  return decodeTripFromUrl(encodedTrip)
}
