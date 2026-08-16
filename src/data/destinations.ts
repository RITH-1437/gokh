import type { Destination } from '../types/trip'

import phnomPenhImg from '../assets/images/place/phnom-penh.png'
import siemReapImg from '../assets/images/place/siem-reab.png'
import angkorWatImg from '../assets/images/place/angkor-wat.png'
import kampotImg from '../assets/images/place/kompot.png'
import kepImg from '../assets/images/place/kep.png'
import kohRongImg from '../assets/images/place/koh-rong.png'
import battambangImg from '../assets/images/place/battambong.png'
import bokorImg from '../assets/images/place/bokor-mountain.png'

export const CAMBODIAN_DESTINATIONS: Destination[] = [
  {
    name: 'Phnom Penh',
    region: 'Capital',
    emoji: '🏙️',
    tagline: 'The bustling capital',
    suggestedName: 'Phnom Penh City Trip',
    image: phnomPenhImg,
    coordinates: { lat: 11.5564, lon: 104.9282 }
  },
  {
    name: 'Siem Reap',
    region: 'Northwest',
    emoji: '🛕',
    tagline: 'Home of Angkor Wat',
    suggestedName: 'Angkor Wat Trip',
    image: siemReapImg,
    coordinates: { lat: 13.3618, lon: 103.8602 }
  },
  {
    name: 'Angkor Wat',
    region: 'Siem Reap',
    emoji: '🏛️',
    tagline: 'Temples of wonders',
    suggestedName: 'Temple Explorer Trip',
    image: angkorWatImg,
    coordinates: { lat: 13.4125, lon: 103.8670 }
  },
  {
    name: 'Kampot',
    region: 'South',
    emoji: '🌊',
    tagline: 'Riverside charm',
    suggestedName: 'Kampot Riverside Trip',
    image: kampotImg,
    coordinates: { lat: 10.6104, lon: 104.1785 }
  },
  {
    name: 'Kep',
    region: 'South',
    emoji: '🦀',
    tagline: 'Seaside crab town',
    suggestedName: 'Kep Crab & Beach Trip',
    image: kepImg,
    coordinates: { lat: 10.4347, lon: 104.2947 }
  },
  {
    name: 'Koh Rong',
    region: 'Islands',
    emoji: '🏖️',
    tagline: 'Island escape',
    suggestedName: 'Koh Rong Island Escape',
    image: kohRongImg,
    coordinates: { lat: 10.7819, lon: 103.2078 }
  },
  {
    name: 'Koh Rong Sanloem',
    region: 'Islands',
    emoji: '🏝️',
    tagline: 'Quiet island bliss',
    suggestedName: 'Sanloem Island Escape',
    image: kohRongImg,
    coordinates: { lat: 10.6725, lon: 103.2683 }
  },
  {
    name: 'Sihanoukville',
    region: 'South',
    emoji: '🌴',
    tagline: 'Beach city',
    suggestedName: 'Sihanoukville Beach Trip',
    coordinates: { lat: 10.6354, lon: 103.5228 }
  },
  {
    name: 'Battambang',
    region: 'Northwest',
    emoji: '🚂',
    tagline: 'Bamboo train country',
    suggestedName: 'Bamboo Train Adventure',
    image: battambangImg,
    coordinates: { lat: 13.0957, lon: 103.2018 }
  },
  {
    name: 'Mondulkiri',
    region: 'Northeast',
    emoji: '⛰️',
    tagline: 'Green highlands',
    suggestedName: 'Mondulkiri Highlands Trip',
    coordinates: { lat: 12.4447, lon: 107.2028 }
  },
  {
    name: 'Ratanakiri',
    region: 'Northeast',
    emoji: '🌋',
    tagline: 'Volcanic lakes & jungle',
    suggestedName: 'Ratanakiri Jungle Adventure',
    coordinates: { lat: 13.7392, lon: 106.9875 }
  },
  {
    name: 'Koh Kong',
    region: 'West',
    emoji: '🌳',
    tagline: 'Cardamom wilds',
    suggestedName: 'Cardamom Jungle Adventure',
    coordinates: { lat: 11.5708, lon: 102.9842 }
  },
  {
    name: 'Bokor',
    region: 'Kampot',
    emoji: '🏰',
    tagline: 'Misty hill station',
    suggestedName: 'Bokor Hill Station Trip',
    image: bokorImg,
    coordinates: { lat: 10.6983, lon: 104.0083 }
  },
  {
    name: 'Kulen Mountain',
    region: 'Siem Reap',
    emoji: '💦',
    tagline: 'Waterfalls & lingas',
    suggestedName: 'Kulen Waterfall Adventure',
    coordinates: { lat: 13.6917, lon: 104.0389 }
  }
]

export const POPULAR_DESTINATIONS = CAMBODIAN_DESTINATIONS.filter(dest =>
  ['Phnom Penh', 'Siem Reap', 'Angkor Wat', 'Kampot', 'Kep', 'Koh Rong', 'Battambang'].includes(dest.name)
)

export const findDestination = (name: string): Destination | undefined => {
  if (!name) return undefined
  return CAMBODIAN_DESTINATIONS.find(
    d => d.name.toLowerCase() === name.toLowerCase()
  )
}