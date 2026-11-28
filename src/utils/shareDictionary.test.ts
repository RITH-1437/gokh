import { describe, it, expect } from 'vitest'
import { SHARE_CHECKLIST, SHARE_DICTIONARY, SHARE_DICTIONARY_CAPACITY } from './shareDictionary'
import { CAMBODIAN_DESTINATIONS } from '../data/destinations'
import { ACTIVITY_SUGGESTIONS } from '../data/activities'
import { ROUTE_TEMPLATES } from '../data/routes'
import { CHECKLIST_IDS } from '../data/essentials'

// Old share links point at phrases by index. This snapshot fails if anyone
// edits, reorders or deletes an existing entry. Appending is always fine.
// Leave these two constants alone; they only cover the first FROZEN_LENGTH entries.
const FROZEN_LENGTH = 235
const FROZEN_SHA256 = '1ce006824549b8063c08d963ee56e30b540268f09ae4b019557cd818e58c3c1c'

const sha256 = async (text: string) =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

describe('share dictionary', () => {
  it('existing entries are frozen (append-only)', async () => {
    expect(SHARE_DICTIONARY.length).toBeGreaterThanOrEqual(FROZEN_LENGTH)
    expect(await sha256(SHARE_DICTIONARY.slice(0, FROZEN_LENGTH).join('\n'))).toBe(FROZEN_SHA256)
  })

  it('has no duplicates and fits the reserved token space', () => {
    expect(new Set(SHARE_DICTIONARY).size).toBe(SHARE_DICTIONARY.length)
    expect(SHARE_DICTIONARY.length).toBeLessThanOrEqual(SHARE_DICTIONARY_CAPACITY)
  })

  it('covers all catalog text so links stay short (append any phrase listed here)', () => {
    const catalog = [
      ...CAMBODIAN_DESTINATIONS.flatMap(d => [d.name, d.suggestedName ?? '']),
      ...Object.keys(ACTIVITY_SUGGESTIONS),
      ...Object.values(ACTIVITY_SUGGESTIONS).flat(),
      ...ROUTE_TEMPLATES.flatMap(r => r.days.flat()),
    ].filter(Boolean)
    expect(catalog.filter(phrase => !SHARE_DICTIONARY.includes(phrase))).toEqual([])
  })

  it('checklist order covers every checklist item', () => {
    expect(CHECKLIST_IDS.filter(id => !SHARE_CHECKLIST.includes(id))).toEqual([])
  })
})
