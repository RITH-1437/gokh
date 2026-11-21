// Suggested activities per destination. Only the first 6 are shown in the UI,
// so each list starts with the must-sees. Content is based on
// docs/Cambodia-destination.md (checked November 2026) — review it before each
// travel season, as opening times, fees and access change.
export const ACTIVITY_SUGGESTIONS: Record<string, string[]> = {
  'Siem Reap': [
    'Angkor Wat Sunrise',
    'Angkor Thom & Bayon',
    'Ta Prohm',
    'Banteay Srei',
    'Pub Street & Night Market',
    'Phare Circus',
    'Kampong Phluk Floating Village',
    'Phnom Kulen',
    'Angkor National Museum',
    'Khmer Cooking Class'
  ],
  'Angkor Wat': [
    'Sunrise at Angkor Wat',
    'Angkor Thom & Bayon',
    'Ta Prohm',
    'Banteay Srei',
    'Preah Khan',
    'Neak Pean',
    'Ta Som',
    'Roluos Group',
    'Kbal Spean',
    'Pre Rup Sunset'
  ],
  'Phnom Penh': [
    'Royal Palace & Silver Pagoda',
    'National Museum',
    'Tuol Sleng Genocide Museum',
    'Choeung Ek Memorial',
    'Sisowath Quay Sunset Cruise',
    'Russian Market',
    'Wat Phnom',
    'Central Market',
    'Koh Dach (Silk Island)',
    'Independence Monument'
  ],
  'Kampot': [
    'Pepper Farm Tour',
    'Bokor National Park',
    'Sunset River Cruise',
    'Salt Fields',
    'Kampong Trach Caves',
    'Night Market',
    'Old Colonial Buildings',
    'Secret Lake',
    'Tek Chhou Rapids',
    'Kep Crab Market'
  ],
  'Kep': [
    'Crab Market',
    'Koh Tonsay (Rabbit Island)',
    'Kep National Park',
    'Kep Beach',
    'Sunset Point',
    'Crab Statue',
    'Pepper Farm Tour',
    'Seafood Dinner',
    'Jungle Trekking',
    'Snorkeling'
  ],
  'Koh Rong': [
    'Long Set Beach',
    'Sok San Beach',
    'Bioluminescent Plankton Swim',
    'Koh Touch Village',
    'Jungle Trekking',
    'Snorkeling',
    'Sunset Boat Tour',
    'Scuba Diving',
    'Fishing Tour',
    'Beach Relaxation'
  ],
  'Koh Rong Sanloem': [
    'Saracen Bay',
    'Lazy Beach',
    "M'Pai Bay",
    'Snorkeling',
    'Scuba Diving',
    'Bioluminescent Plankton Swim',
    'Kayaking',
    'Sunset Beach',
    'Jungle Trekking',
    'Beach Relaxation'
  ],
  'Sihanoukville': [
    'Ferry to Koh Rong',
    'Ferry to Koh Rong Sanloem',
    'Otres Beach',
    'Ream National Park',
    'Kbal Chhay Waterfall',
    'Serendipity Beach',
    'Island Hopping',
    'Sunset Cruise',
    'Night Market',
    'Local Restaurants'
  ],
  'Battambang': [
    'Bamboo Train',
    'Phnom Sampov & Killing Caves',
    'Bat Cave at Sunset',
    'Phare Ponleu Selpak Circus',
    'Wat Banan',
    'Colonial Old Town & Street 2.5',
    'Wat Ko Wooden Houses',
    'Countryside Cycling',
    'Ek Phnom Temple',
    'Battambang Museum'
  ],
  'Mondulkiri': [
    'Elephant Valley Project',
    'The Mondulkiri Project',
    'Bou Sra Waterfall',
    'Sen Monorom',
    'Bunong Villages',
    'Coffee Farms',
    'Grassland Hills',
    'Monorom Waterfall',
    'Waterfall Trekking',
    'Wildlife Viewing'
  ],
  'Ratanakiri': [
    'Yeak Laom Crater Lake',
    'Ka Tieng Waterfall',
    'Cha Ong Waterfall',
    'Virachey National Park Trek',
    'River Trip',
    'Indigenous Villages',
    'Jungle Trekking',
    'Gem Mines',
    'Lumphat Wildlife Sanctuary',
    'Wildlife Viewing'
  ],
  'Koh Kong': [
    'Chi Phat Community',
    'Tatai Waterfall',
    'Mangrove Kayaking',
    'Peam Krasaop Mangroves',
    'Cardamom Mountains',
    'Tatai River Eco-lodge',
    'Jungle Trekking',
    'Tang Kay',
    'Wildlife Viewing',
    'Eco-Tourism'
  ],
  'Bokor': [
    'Bokor Hill Station Ruins',
    'Lok Yeay Mao Statue',
    'Popokvil Waterfall',
    'Old Casino',
    'Scenic Viewpoints',
    'Cloud Forest',
    'Historic Buildings',
    'Jungle Trekking',
    'Wildlife Viewing',
    'Nature Photography'
  ],
  'Kulen Mountain': [
    'River of a Thousand Lingas',
    'Kulen Waterfall Swim',
    'Reclining Buddha',
    'Preah Ang Thom Pagoda',
    'Natural Pools',
    'Sacred Sites',
    'Jungle Trekking',
    'Viewpoints',
    'Wildlife Viewing',
    'Nature Photography'
  ],
  'Tonle Sap': [
    'Kampong Phluk Stilt Village',
    'Kampong Khleang Village',
    'Chong Kneas Floating Village',
    'Sunset Boat Trip',
    'Flooded Forest by Canoe',
    'Local Fish Market'
  ],
  'Beng Mealea': [
    'Beng Mealea Jungle Temple',
    'Koh Ker Day Trip',
    'Temple Photography',
    'Countryside Drive'
  ],
  'Koh Ker': [
    'Prasat Thom Pyramid',
    'Prasat Krahom',
    'Beng Mealea Stop',
    'Lingapura Temple Walk',
    'Temple Photography'
  ],
  'Sambor Prei Kuk': [
    'Prasat Sambor Temples',
    'Prasat Tao (Lion Temple)',
    'Prasat Yeai Poeun',
    'Kampong Thom Town',
    'Temple Photography'
  ],
  'Kratie': [
    'Irrawaddy Dolphins at Kampi',
    'Koh Trong Island Cycling',
    'Mekong Sunset',
    'Riverside Market',
    'Phnom Sambok Pagoda'
  ],
  'Chi Phat': [
    'Community Homestay',
    'Jungle Trekking',
    'Mountain Biking',
    'River Trip',
    'Waterfall Hike',
    'Wildlife Spotting'
  ],
  'Banteay Srei': [
    'Banteay Srei Temple',
    'Kbal Spean River Carvings',
    'Temple Photography',
    'Countryside Drive'
  ],
  'Roluos Group': [
    'Bakong Temple',
    'Preah Ko',
    'Lolei',
    'Temple Photography'
  ],
  'Koh Dach': [
    'Silk Weaving Villages',
    'Mekong Ferry Ride',
    'Village Bike Ride',
    'Riverside Lunch'
  ],
  'Koh Tonsay': [
    'Boat from Kep',
    'Beach Day',
    'Swimming',
    'Seafood Lunch',
    'Island Walk'
  ],
  'Tatai River': [
    'Tatai Waterfall',
    'Mangrove Kayaking',
    'Eco-lodge Stay',
    'River Boat Trip'
  ],
  'Stung Treng': [
    'Mekong Dolphin Spotting',
    'Mekong River Boat Trip',
    'Mekong Sunset',
    'Riverside Market'
  ]
}

// Exact (case-insensitive) match first, then the longest key contained in the
// typed text ("Day in Koh Rong Sanloem" -> "Koh Rong Sanloem", not "Koh Rong").
// Previously the first partial match won in either direction, so
// "Koh Rong Sanloem" got Koh Rong's list and an empty destination matched
// Siem Reap.
export const getSuggestionsForDestination = (destination: string): string[] => {
  const query = destination.trim().toLowerCase()
  if (query.length < 3) return []

  const keys = Object.keys(ACTIVITY_SUGGESTIONS)
  const exact = keys.find(key => key.toLowerCase() === query)
  if (exact) return ACTIVITY_SUGGESTIONS[exact]

  const contained = keys
    .filter(key => query.includes(key.toLowerCase()))
    .sort((a, b) => b.length - a.length)[0]
  if (contained) return ACTIVITY_SUGGESTIONS[contained]

  // Partially typed name ("Angkor" -> "Angkor Wat").
  const prefix = query.length >= 4 ? keys.find(key => key.toLowerCase().startsWith(query)) : undefined
  return prefix ? ACTIVITY_SUGGESTIONS[prefix] : []
}
