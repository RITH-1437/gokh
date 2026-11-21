// Route templates from docs/Cambodia-destination.md ("Sample itineraries").
// Each entry is one day; activity names are added to the matching trip day.

export interface RouteTemplate {
  id: string
  name: string
  summary: string
  days: string[][]
}

export const ROUTE_TEMPLATES: RouteTemplate[] = [
  {
    id: 'classic-7',
    name: 'Classic Cambodia',
    summary: '7 days · Phnom Penh & Angkor',
    days: [
      ['Arrive Phnom Penh (KTI)', 'Riverside walk', 'Sunset river cruise'],
      ['Royal Palace & Silver Pagoda', 'National Museum', 'Tuol Sleng Genocide Museum', 'Choeung Ek Memorial'],
      ['Travel to Siem Reap', 'Pub Street & Night Market'],
      ['Angkor Wat Sunrise', 'Angkor Thom & Bayon', 'Ta Prohm'],
      ['Grand Circuit: Preah Khan, Neak Pean, Ta Som'],
      ['Banteay Srei & Kbal Spean (or Phnom Kulen)', 'Phare Circus'],
      ['Tonle Sap floating village (or Roluos Group)', 'Fly out (SAI)']
    ]
  },
  {
    id: 'temples-coast-10',
    name: 'Temples & coast',
    summary: '10 days · Angkor, Phnom Penh, Kampot & islands',
    days: [
      ['Angkor Wat Sunrise', 'Angkor Thom & Bayon', 'Ta Prohm'],
      ['Grand Circuit: Preah Khan, Neak Pean, Ta Som'],
      ['Banteay Srei & Kbal Spean', 'Phare Circus'],
      ['Koh Ker & Beng Mealea day trip'],
      ['Drive to Phnom Penh', 'Stop at Sambor Prei Kuk'],
      ['Royal Palace & Silver Pagoda', 'Tuol Sleng Genocide Museum', 'Sisowath Quay Sunset Cruise'],
      ['Travel to Kampot', 'Pepper Farm Tour', 'Sunset River Cruise'],
      ['Bokor National Park', 'Kep Crab Market'],
      ['Ferry to Koh Rong Sanloem', 'Saracen Bay'],
      ['Beach morning', 'Back to Phnom Penh or fly out (KOS)']
    ]
  },
  {
    id: 'grand-14',
    name: 'Grand tour',
    summary: '14 days · Angkor to the wild northeast & coast',
    days: [
      ['Angkor Wat Sunrise', 'Angkor Thom & Bayon', 'Ta Prohm'],
      ['Grand Circuit: Preah Khan, Neak Pean, Ta Som'],
      ['Banteay Srei & Kbal Spean', 'Phare Circus'],
      ['Phnom Kulen or Tonle Sap floating village'],
      ['Travel to Battambang', 'Bamboo Train', 'Bat Cave at Sunset'],
      ['Wat Banan', 'Countryside Cycling', 'Phare Ponleu Selpak Circus'],
      ['Travel to Phnom Penh', 'Sisowath Quay Sunset Cruise'],
      ['Royal Palace & Silver Pagoda', 'Tuol Sleng Genocide Museum', 'Choeung Ek Memorial'],
      ['Travel to Kratie', 'Irrawaddy Dolphins at Kampi'],
      ['Travel to Mondulkiri', 'Elephant Valley Project'],
      ['Travel to Kampot', 'Pepper Farm Tour'],
      ['Bokor National Park', 'Kep Crab Market'],
      ['Ferry to Koh Rong Sanloem', 'Saracen Bay'],
      ['Beach morning', 'Return or fly out (KOS)']
    ]
  }
]

/**
 * Activity names to add per day: days that already have activities are left
 * alone, and a template longer than the trip is cut to the trip's length.
 */
export const planRouteTemplate = (
  template: RouteTemplate,
  dayHasActivities: boolean[]
): { dayIndex: number; names: string[] }[] =>
  dayHasActivities
    .map((has, dayIndex) => ({ dayIndex, names: has ? [] : template.days[dayIndex] ?? [] }))
    .filter(entry => entry.names.length > 0)
