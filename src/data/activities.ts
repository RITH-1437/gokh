export const ACTIVITY_SUGGESTIONS: Record<string, string[]> = {
  'Siem Reap': [
    'Angkor Wat',
    'Bayon Temple',
    'Ta Prohm',
    'Pub Street',
    'Old Market',
    'Tonlé Sap',
    'Kulen Mountain',
    'Banteay Srei',
    'Angkor Thom',
    'Phare Circus'
  ],
  'Phnom Penh': [
    'Royal Palace',
    'National Museum',
    'Wat Phnom',
    'Central Market',
    'Riverside',
    'Tuol Sleng Museum',
    'Killing Fields',
    'Russian Market',
    'Diamond Island',
    'Independence Monument'
  ],
  'Kampot': [
    'Bokor Mountain',
    'Kampot River',
    'Pepper Farm',
    'Salt Fields',
    'Secret Lake',
    'Rabbit Island',
    'Old Colonial Buildings',
    'Kampot Market',
    'Tek Chhou Rapids',
    'Cave Temple'
  ],
  'Kep': [
    'Kep Beach',
    'Crab Market',
    'Kep National Park',
    'Rabbit Island',
    'Crab Statue',
    'Seafood Market',
    'Veranda Natural Resort',
    'Sunset Point',
    'Jungle Trekking',
    'Snorkeling'
  ],
  'Battambang': [
    'Bamboo Train',
    'Phnom Sampov',
    'Battambang City',
    'Killing Caves',
    'Wat Banan',
    'French Colonial Architecture',
    'Battambang Museum',
    'Phnom Sampeau',
    'Ek Phnom Temple',
    'Local Markets'
  ],
  'Mondulkiri': [
    'Bou Sra Waterfall',
    'Sen Monorom',
    'Forest areas',
    'Elephant Sanctuary',
    'Waterfall Trekking',
    'Indigenous Villages',
    'Chrey ROM Waterfall',
    'Monorom Waterfall',
    'Nature Walks',
    'Wildlife Viewing'
  ],
  'Angkor Wat': [
    'Sunrise at Angkor Wat',
    'Bayon Temple',
    'Ta Prohm',
    'Angkor Thom',
    'Banteay Srei',
    'Preah Khan',
    'Neak Pean',
    'Ta Som',
    'East Mebon',
    'Pre Rup'
  ],
  'Koh Rong': [
    'Beach Relaxation',
    'Snorkeling',
    'Bioluminescent Plankton',
    'Long Beach',
    'Koh Tuich Village',
    'Jungle Trekking',
    'Fishing Tours',
    'Sunset Boat Tours',
    'Scuba Diving',
    'Beach Parties'
  ],
  'Koh Rong Sanloem': [
    'Lazy Beach',
    'Saracen Bay',
    'Snorkeling',
    'Jungle Trekking',
    'Sunset Beach',
    'Scuba Diving',
    'Kayaking',
    'Fishing Tours',
    'Bioluminescent Plankton',
    'Beach Relaxation'
  ],
  'Sihanoukville': [
    'Otres Beach',
    'Serendipity Beach',
    'Kampong Som Bay',
    'Kbal Chhay Waterfall',
    'Ream National Park',
    'Water Sports',
    'Island Hopping',
    'Sunset Cruises',
    'Night Markets',
    'Local Restaurants'
  ],
  'Ratanakiri': [
    'Yeak Laom Volcanic Lake',
    'Virachey National Park',
    'Gem Mines',
    'Waterfalls',
    'Indigenous Villages',
    'Jungle Trekking',
    'Wildlife Viewing',
    'Cha Ong Waterfall',
    'Katieng Waterfall',
    'Lumphat Wildlife Sanctuary'
  ],
  'Koh Kong': [
    'Cardamom Mountains',
    'Tatai Waterfall',
    'Chi Phat Community',
    'Tang Kay',
    'Peam Krasaop',
    'Mangrove Forests',
    'Jungle Trekking',
    'Kayaking',
    'Wildlife Viewing',
    'Eco-Tourism'
  ],
  'Bokor': [
    'Bokor Hill Station',
    'Old Casino',
    'Popokvil Waterfall',
    'Thansur Sokha Hotel',
    'Jungle Trekking',
    'Cloud Forest',
    'Historic Buildings',
    'Scenic Viewpoints',
    'Wildlife Viewing',
    'Nature Photography'
  ],
  'Kulen Mountain': [
    'River of Thousand Lingas',
    'Waterfall',
    'Pagoda',
    'Reclining Buddha',
    'Jungle Trekking',
    'Natural Pools',
    'Sacred Sites',
    'Viewpoints',
    'Wildlife Viewing',
    'Nature Photography'
  ]
}

export const getSuggestionsForDestination = (destination: string): string[] => {
  // Find matching destination (case-insensitive, partial match)
  const matchingKey = Object.keys(ACTIVITY_SUGGESTIONS).find(key => 
    destination.toLowerCase().includes(key.toLowerCase()) || 
    key.toLowerCase().includes(destination.toLowerCase())
  )
  
  return matchingKey ? ACTIVITY_SUGGESTIONS[matchingKey] : []
}
