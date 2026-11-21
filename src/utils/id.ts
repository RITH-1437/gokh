// Collision-safe IDs for members and activities. `Date.now()` (the previous
// approach) collides when two items are created in the same millisecond,
// e.g. adding several suggested activities quickly.
let fallbackCounter = 0

export const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  fallbackCounter += 1
  return `${Date.now().toString(36)}-${fallbackCounter.toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
