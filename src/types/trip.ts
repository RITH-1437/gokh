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
  coordinates?: {
    lat: number
    lon: number
  }
}
