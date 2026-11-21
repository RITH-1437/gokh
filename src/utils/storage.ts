import type { Trip } from '../types/trip'
import { sanitizeTrip } from './tripSchema'

// Local draft persistence. Before this, a page refresh lost the whole trip
// (the `?trip=` param is stripped from the URL once a shared trip is loaded).
// Storage can be unavailable (private mode, quota, disabled cookies), so every
// access is guarded and failures degrade to "no persistence".

export const STORAGE_KEY = 'gokh:trip:v1'

const getStorage = (): Storage | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export const loadSavedTrip = (): Trip | null => {
  const storage = getStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    return raw ? sanitizeTrip(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export const saveTrip = (trip: Trip): boolean => {
  const storage = getStorage()
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(trip))
    return true
  } catch {
    return false
  }
}

export const clearSavedTrip = (): void => {
  try {
    getStorage()?.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable — nothing to clear */
  }
}
