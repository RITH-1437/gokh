export type Currency = 'USD' | 'KHR'

export type MemberRole = 'leader' | 'member'

export type TransportationType = 'motorcycle' | 'van' | 'bus'

export type AccommodationType = 'hotel' | 'guesthouse' | 'camping'

export interface Member {
  id: string
  name: string
  role: MemberRole
}

export interface Contribution {
  memberId: string
  amount: number
  currency: Currency
}

export interface Budget {
  total: number
  currency: Currency
  contributions: Contribution[]
}

export interface Activity {
  id: string
  name: string
  description?: string
  startTime?: string
  endTime?: string
}

export interface ItineraryDay {
  dayNumber: number
  date: string
  activities: Activity[]
}

export interface Transportation {
  type: TransportationType
  note?: string
}

export interface Accommodation {
  type: AccommodationType
  name?: string
}

export interface Trip {
  id?: string
  tripName: string
  destination: string
  members: Member[]
  startDate: string
  endDate: string
  transportation: Transportation
  accommodation: Accommodation
  budget: Budget
  itinerary: ItineraryDay[]
  /** Ids of completed "Before you go" checklist items (shared with the group). */
  checklist?: string[]
}

export interface WeatherDay {
  date: string
  temperature: number
  weatherCode: number
  rainChance: number
}

export interface Destination {
  name: string
  region: string
  emoji?: string
  tagline?: string
  suggestedName?: string
  image?: string
  /** Required attribution for remote (Wikimedia Commons) photos. */
  imageCredit?: ImageCredit
  /** Suggested length of stay, e.g. "2–3 days" (docs/Cambodia-destination.md). */
  days?: string
  /** Best months to visit, e.g. "Nov–May". */
  bestSeason?: string
  /** Safety / access note shown to travellers. Review before each season. */
  advisory?: string
  /** Entry fees for foreign adults. Verified on FEES_CHECKED (data/destinations.ts). */
  fees?: EntryFee[]
  /** Etiquette / good-to-know notes, e.g. dress codes or content notes. */
  tips?: string[]
  coordinates?: {
    lat: number
    lon: number
  }
}

export interface EntryFee {
  label: string
  price: string
  note?: string
}

export interface ImageCredit {
  author: string
  license: string
  source: string
}
