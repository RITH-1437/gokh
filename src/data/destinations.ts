import type { Destination } from '../types/trip'

import phnomPenhImg from '../assets/images/place/phnom-penh.webp'
import siemReapImg from '../assets/images/place/siem-reab.webp'
import angkorWatImg from '../assets/images/place/angkor-wat.webp'
import kampotImg from '../assets/images/place/kompot.webp'
import kepImg from '../assets/images/place/kep.webp'
import kohRongImg from '../assets/images/place/koh-rong.webp'
import battambangImg from '../assets/images/place/battambong.webp'
import bokorImg from '../assets/images/place/bokor-mountain.webp'

// Date the entry fees and tips were last checked against official sources.
export const FEES_CHECKED = 'Nov 2026'

export const CAMBODIAN_DESTINATIONS: Destination[] = [
  {
    name: 'Phnom Penh',
    region: 'Capital',
    emoji: '🏙️',
    tagline: 'The bustling capital',
    suggestedName: 'Phnom Penh City Trip',
    image: phnomPenhImg,
    days: '2–3 days',
    bestSeason: 'Nov–Mar',
    fees: [
      { label: 'Royal Palace & Silver Pagoda', price: '~$10', note: 'Daily 8–11 am, 2–5 pm' },
      { label: 'Tuol Sleng Genocide Museum (S-21)', price: '$5', note: '+$5 audio guide; cash only' },
      { label: 'Choeung Ek Genocidal Center', price: '$3', note: '+$3 audio guide' }
    ],
    tips: [
      'Content note: Tuol Sleng and Choeung Ek are memorial sites of the Khmer Rouge years and are not suitable for young children. Dress modestly and keep quiet.',
      'Cover shoulders and knees at temples; remove shoes and hats where asked.'
    ],
    coordinates: { lat: 11.5564, lon: 104.9282 }
  },
  {
    name: 'Siem Reap',
    region: 'Angkor',
    emoji: '🛕',
    tagline: 'Home of Angkor Wat',
    suggestedName: 'Angkor Wat Trip',
    image: siemReapImg,
    days: '3–4 days',
    bestSeason: 'Nov–Mar',
    fees: [
      { label: 'Angkor Pass · 1 day', price: '$37' },
      { label: 'Angkor Pass · 3 days', price: '$62', note: 'Any 3 days within 7; photo needed' },
      { label: 'Angkor Pass · 7 days', price: '$72', note: 'Any 7 days within 30; photo needed' }
    ],
    tips: [
      'Cover shoulders and knees at temples; remove shoes and hats where asked.',
      'Buy the Angkor Pass only from Angkor Enterprise (online or the Road 60 office). Under-12s enter free.'
    ],
    coordinates: { lat: 13.3618, lon: 103.8602 }
  },
  {
    name: 'Angkor Wat',
    region: 'Angkor',
    emoji: '🏛️',
    tagline: 'Temples of wonders',
    suggestedName: 'Temple Explorer Trip',
    image: angkorWatImg,
    days: '3–4 days',
    bestSeason: 'Nov–Mar',
    fees: [
      { label: 'Angkor Pass · 1 day', price: '$37' },
      { label: 'Angkor Pass · 3 days', price: '$62', note: 'Any 3 days within 7; photo needed' },
      { label: 'Angkor Pass · 7 days', price: '$72', note: 'Any 7 days within 30; photo needed' }
    ],
    tips: [
      'Cover shoulders and knees at temples; remove shoes and hats where asked.',
      'Arrive before 5:30 am for sunrise. A ticket dated for tomorrow lets you in for sunset from 4:45 pm the evening before.',
      'The pass also covers Banteay Srei, Kbal Spean, Beng Mealea and the Roluos group, but not Koh Ker or Phnom Kulen.'
    ],
    coordinates: { lat: 13.4125, lon: 103.8670 }
  },
  {
    name: 'Kampot',
    region: 'South coast',
    emoji: '🌊',
    tagline: 'Riverside charm',
    suggestedName: 'Kampot Riverside Trip',
    image: kampotImg,
    days: '2–3 days',
    bestSeason: 'Nov–May',
    coordinates: { lat: 10.6104, lon: 104.1785 }
  },
  {
    name: 'Kep',
    region: 'South coast',
    emoji: '🦀',
    tagline: 'Seaside crab town',
    suggestedName: 'Kep Crab & Beach Trip',
    image: kepImg,
    days: '1–2 days',
    bestSeason: 'Nov–May',
    coordinates: { lat: 10.4347, lon: 104.2947 }
  },
  {
    name: 'Koh Rong',
    region: 'South coast',
    emoji: '🏖️',
    tagline: 'Island escape',
    suggestedName: 'Koh Rong Island Escape',
    image: kohRongImg,
    days: '2–3 days',
    bestSeason: 'Nov–May',
    tips: [
      'Ferries leave from different piers in Sihanoukville — check your pier when booking. Seas are calmest Nov–May.'
    ],
    coordinates: { lat: 10.7819, lon: 103.2078 }
  },
  {
    name: 'Koh Rong Sanloem',
    region: 'South coast',
    emoji: '🏝️',
    tagline: 'Quiet island bliss',
    suggestedName: 'Sanloem Island Escape',
    days: '2–3 days',
    bestSeason: 'Nov–May',
    tips: [
      'Ferries leave from different piers in Sihanoukville — check your pier when booking. Seas are calmest Nov–May.'
    ],
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Koh_Rong_Sanloem_estuary.jpg/960px-Koh_Rong_Sanloem_estuary.jpg',
    imageCredit: { author: 'Wikirictor', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Koh_Rong_Sanloem_estuary.jpg' },
    coordinates: { lat: 10.6725, lon: 103.2683 }
  },
  {
    name: 'Sihanoukville',
    region: 'South coast',
    emoji: '🌴',
    tagline: 'Gateway to the islands',
    suggestedName: 'Sihanoukville Beach Trip',
    days: '0–1 day',
    bestSeason: 'Nov–May',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Aerial_View_of_Golden_Lions_Roundabout.jpg/960px-Aerial_View_of_Golden_Lions_Roundabout.jpg',
    imageCredit: { author: 'Kiensvay', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Aerial_View_of_Golden_Lions_Roundabout.jpg' },
    coordinates: { lat: 10.6354, lon: 103.5228 }
  },
  {
    name: 'Battambang',
    region: 'Northwest',
    emoji: '🚂',
    tagline: 'Bamboo train country',
    suggestedName: 'Bamboo Train Adventure',
    image: battambangImg,
    days: '2 days',
    bestSeason: 'Nov–Mar',
    fees: [
      { label: 'Bamboo train (norry)', price: '~$5' }
    ],
    tips: [
      'Be at Phnom Sampov before sunset to see millions of bats leave the Bat Cave.'
    ],
    coordinates: { lat: 13.0957, lon: 103.2018 }
  },
  {
    name: 'Mondulkiri',
    region: 'Northeast',
    emoji: '⛰️',
    tagline: 'Green highlands',
    suggestedName: 'Mondulkiri Highlands Trip',
    days: '2–3 days',
    bestSeason: 'Nov–Apr',
    fees: [
      { label: 'Elephant Valley Project day visit', price: '$55–85', note: 'Includes transport and lunch' }
    ],
    tips: [
      'Choose sanctuaries where you walk with elephants, not ride them.'
    ],
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Bou_Sra_Waterfall%2C_Mondulkiri%2C_Cambodia.jpg/960px-Bou_Sra_Waterfall%2C_Mondulkiri%2C_Cambodia.jpg',
    imageCredit: { author: 'Dtfman', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Bou_Sra_Waterfall,_Mondulkiri,_Cambodia.jpg' },
    coordinates: { lat: 12.4447, lon: 107.2028 }
  },
  {
    name: 'Ratanakiri',
    region: 'Northeast',
    emoji: '🌋',
    tagline: 'Volcanic lakes & jungle',
    suggestedName: 'Ratanakiri Jungle Adventure',
    days: '2–3 days',
    bestSeason: 'Nov–Apr',
    tips: [
      'Stay on marked paths in forests and rural areas — landmines remain in some places.'
    ],
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Yeak_Laom_Lake_in_Paranoma_-Photo_2016-.jpg/960px-Yeak_Laom_Lake_in_Paranoma_-Photo_2016-.jpg',
    imageCredit: { author: 'Chamnanmuon', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Yeak_Laom_Lake_in_Paranoma_-Photo_2016-.jpg' },
    coordinates: { lat: 13.7392, lon: 106.9875 }
  },
  {
    name: 'Koh Kong',
    region: 'Southwest',
    emoji: '🌳',
    tagline: 'Cardamom wilds',
    suggestedName: 'Cardamom Jungle Adventure',
    days: '1–2 days',
    bestSeason: 'Nov–Apr',
    advisory: 'Koh Kong town is on the Thai border, inside the area some governments advise against. Check the latest travel advice before booking.',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/2015_0319_174425_KohKongIsland_Strandidylle.jpg/960px-2015_0319_174425_KohKongIsland_Strandidylle.jpg',
    imageCredit: { author: 'Christiane Bender', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:2015_0319_174425_KohKongIsland_Strandidylle.jpg' },
    coordinates: { lat: 11.5708, lon: 102.9842 }
  },
  {
    name: 'Bokor',
    region: 'South coast',
    emoji: '🏰',
    tagline: 'Misty hill station',
    suggestedName: 'Bokor Hill Station Trip',
    image: bokorImg,
    days: '1 day',
    bestSeason: 'Nov–May',
    tips: [
      'Bring a jacket — it is much cooler on the plateau.'
    ],
    coordinates: { lat: 10.6983, lon: 104.0083 }
  },
  {
    name: 'Kulen Mountain',
    region: 'Angkor',
    emoji: '💦',
    tagline: 'Waterfalls & lingas',
    suggestedName: 'Kulen Waterfall Adventure',
    days: '1 day',
    bestSeason: 'Jun–Dec',
    fees: [
      { label: 'Phnom Kulen National Park', price: '$20', note: 'Cash; not covered by the Angkor Pass' }
    ],
    tips: [
      'The road up is only open 7–11 am, so leave Siem Reap by 9 am.'
    ],
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/PhnomKulen.jpg/960px-PhnomKulen.jpg',
    imageCredit: { author: 'Narith5', license: 'CC BY 2.0', source: 'https://commons.wikimedia.org/wiki/File:PhnomKulen.jpg' },
    coordinates: { lat: 13.6917, lon: 104.0389 }
  },
  {
    name: 'Tonle Sap',
    region: 'Angkor',
    emoji: '🛶',
    tagline: 'Floating villages',
    suggestedName: 'Tonle Sap Floating Villages',
    days: 'Half day',
    bestSeason: 'Jul–Dec',
    tips: [
      'Visit in the wet season — water is low in the dry months.'
    ],
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Cambodia%2C_Tonle_Sap_IMG_3285.JPG/960px-Cambodia%2C_Tonle_Sap_IMG_3285.JPG',
    imageCredit: { author: 'Deror_avi', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Cambodia,_Tonle_Sap_IMG_3285.JPG' },
    coordinates: { lat: 13.2083, lon: 103.9894 }
  },
  {
    name: 'Beng Mealea',
    region: 'Northwest',
    emoji: '🌿',
    tagline: 'Temple lost in the jungle',
    suggestedName: 'Jungle Temple Trip',
    days: 'Half day',
    bestSeason: 'All year',
    fees: [
      { label: 'Beng Mealea', price: 'Angkor Pass', note: 'Or buy a single-site ticket' }
    ],
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Bengmealea.jpg/960px-Bengmealea.jpg',
    imageCredit: { author: 'Writer128', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Bengmealea.jpg' },
    coordinates: { lat: 13.4767, lon: 104.2383 }
  },
  {
    name: 'Koh Ker',
    region: 'Northwest',
    emoji: '🔺',
    tagline: 'Remote UNESCO pyramid temple',
    suggestedName: 'Koh Ker Temple Trip',
    days: '1 day',
    bestSeason: 'Nov–Mar',
    fees: [
      { label: 'Koh Ker', price: '$15', note: 'Not covered by the Angkor Pass' }
    ],
    tips: [
      'Pairs with Beng Mealea in one long day trip from Siem Reap.'
    ],
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/0505280017PThompyramid.jpg',
    imageCredit: { author: 'Peaceofangkor', license: 'Public domain', source: 'https://commons.wikimedia.org/wiki/File:0505280017PThompyramid.jpg' },
    coordinates: { lat: 13.7840, lon: 104.5370 }
  },
  {
    name: 'Sambor Prei Kuk',
    region: 'Northwest',
    emoji: '🧱',
    tagline: 'Pre-Angkor UNESCO temples',
    suggestedName: 'Sambor Prei Kuk Heritage Trip',
    days: '½–1 day',
    bestSeason: 'Nov–Mar',
    fees: [
      { label: 'Sambor Prei Kuk', price: 'Small fee', note: 'Cash only' }
    ],
    tips: [
      'A good stop when driving between Phnom Penh and Siem Reap.'
    ],
    coordinates: { lat: 12.8710, lon: 105.0430 }
  },
  {
    name: 'Kratie',
    region: 'Northeast',
    emoji: '🐬',
    tagline: 'Mekong river dolphins',
    suggestedName: 'Mekong Dolphin Trip',
    days: '1–2 days',
    bestSeason: 'Dec–May',
    tips: [
      'Dolphins stay in the deep pools in the dry season, the best time to see them.'
    ],
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/20171123_Sunset_over_Mekong_Kratie_3996_DxO.jpg/960px-20171123_Sunset_over_Mekong_Kratie_3996_DxO.jpg',
    imageCredit: { author: 'Jakub Hałun', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:20171123_Sunset_over_Mekong_Kratie_3996_DxO.jpg' },
    coordinates: { lat: 12.4881, lon: 106.0188 }
  },
  {
    name: 'Chi Phat',
    region: 'Southwest',
    emoji: '🏕️',
    tagline: 'Community ecotourism in the rainforest',
    suggestedName: 'Cardamom Eco Adventure',
    days: '2–3 days',
    bestSeason: 'Nov–Apr',
    tips: [
      'Stay on marked paths in forests and rural areas — landmines remain in some places.'
    ],
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Cardamom_Mountains_Cambodia.jpg/960px-Cardamom_Mountains_Cambodia.jpg',
    imageCredit: { author: 'Andyb3947', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Cardamom_Mountains_Cambodia.jpg' },
    coordinates: { lat: 11.3500, lon: 103.5200 }
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