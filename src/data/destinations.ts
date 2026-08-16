import type { Destination } from '../types/trip'

import phnomPenhImg from '../assets/images/phnom-penh.png'
import angkorWatImg from '../assets/images/angkor-wat.png'
import kampotImg from '../assets/images/kompot.png'
import kepImg from '../assets/images/kep.png'
import kohRongImg from '../assets/images/koh-rong.png'
import battambangImg from '../assets/images/battambong.png'
import bokorImg from '../assets/images/bokor-mountain.png'

export const CAMBODIAN_DESTINATIONS: Destination[] = [
  {
    name: 'Phnom Penh',
    region: 'Capital',
    emoji: '🏙️',
    tagline: 'The bustling capital',
    image: phnomPenhImg,
    coordinates: { lat: 11.5564, lon: 104.9282 }
  },
  {
    name: 'Siem Reap',
    region: 'Northwest',
    emoji: '🛕',
    tagline: 'Home of Angkor Wat',
    image: angkorWatImg,
    coordinates: { lat: 13.3618, lon: 103.8602 }
  },
  {
    name: 'Angkor Wat',
    region: 'Siem Reap',
    emoji: '🏛️',
    tagline: 'Temples of wonders',
    image: angkorWatImg,
    coordinates: { lat: 13.4125, lon: 103.8670 }
  },
  {
    name: 'Kampot',
    region: 'South',
    emoji: '🌊',
    tagline: 'Riverside charm',
    image: kampotImg,
    coordinates: { lat: 10.6104, lon: 104.1785 }
  },
  {
    name: 'Kep',
    region: 'South',
    emoji: '🦀',
    tagline: 'Seaside crab town',
    image: kepImg,
    coordinates: { lat: 10.4347, lon: 104.2947 }
  },
  {
    name: 'Koh Rong',
    region: 'Islands',
    emoji: '🏖️',
    tagline: 'Island escape',
    image: kohRongImg,
    coordinates: { lat: 10.7819, lon: 103.2078 }
  },
  {
    name: 'Koh Rong Sanloem',
    region: 'Islands',
    emoji: '🏝️',
    tagline: 'Quiet island bliss',
    image: kohRongImg,
    coordinates: { lat: 10.6725, lon: 103.2683 }
  },
  {
    name: 'Sihanoukville',
    region: 'South',
    emoji: '🌴',
    tagline: 'Beach city',
    coordinates: { lat: 10.6354, lon: 103.5228 }
  },
  {
    name: 'Battambang',
    region: 'Northwest',
    emoji: '🚂',
    tagline: 'Bamboo train country',
    image: battambangImg,
    coordinates: { lat: 13.0957, lon: 103.2018 }
  },
  {
    name: 'Mondulkiri',
    region: 'Northeast',
    emoji: '⛰️',
    tagline: 'Green highlands',
    coordinates: { lat: 12.4447, lon: 107.2028 }
  },
  {
    name: 'Ratanakiri',
    region: 'Northeast',
    emoji: '🌋',
    tagline: 'Volcanic lakes & jungle',
    coordinates: { lat: 13.7392, lon: 106.9875 }
  },
  {
    name: 'Koh Kong',
    region: 'West',
    emoji: '🌳',
    tagline: 'Cardamom wilds',
    coordinates: { lat: 11.5708, lon: 102.9842 }
  },
  {
    name: 'Bokor',
    region: 'Kampot',
    emoji: '🏰',
    tagline: 'Misty hill station',
    image: bokorImg,
    coordinates: { lat: 10.6983, lon: 104.0083 }
  },
  {
    name: 'Kulen Mountain',
    region: 'Siem Reap',
    emoji: '💦',
    tagline: 'Waterfalls & lingas',
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