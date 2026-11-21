// "Before you go" content, from docs/Cambodia-destination.md
// (Practical travel essentials, checked November 2026). Review each season.

export interface ChecklistItem {
  id: string
  label: string
  detail: string
}

export const ESSENTIALS_CHECKED = 'Nov 2026'

export const PRE_TRIP_CHECKLIST: ChecklistItem[] = [
  {
    id: 'visa',
    label: 'Get a tourist visa',
    detail: '$30 e-visa (single entry, 30 days) at the official portal evisa.gov.kh, or visa on arrival at the airports. ASEAN citizens enter visa-free.'
  },
  {
    id: 'e-arrival',
    label: 'Submit the e-Arrival card',
    detail: 'Free and required for every air traveller. Submit it in the 7 days before your flight, only on the official portal or app.'
  },
  {
    id: 'cash',
    label: 'Bring clean US dollar notes',
    detail: 'Dollars are accepted almost everywhere; change under $1 comes in riel. Bakong / ABA QR payments are widely accepted.'
  },
  {
    id: 'clothes',
    label: 'Pack temple-appropriate clothes',
    detail: 'Shoulders and knees covered for temples and the Royal Palace.'
  },
  {
    id: 'rides',
    label: 'Install a ride-hailing app',
    detail: 'PassApp or Grab give fixed prices for tuk-tuks and cars in cities.'
  },
  {
    id: 'advice',
    label: 'Check the latest travel advice',
    detail: 'Avoid the Thai border area; land crossings with Thailand are closed for now.'
  }
]

export const CHECKLIST_IDS = PRE_TRIP_CHECKLIST.map(item => item.id)

export interface InfoBlock {
  title: string
  emoji: string
  lines: string[]
}

export const PRACTICAL_INFO: InfoBlock[] = [
  {
    title: 'Airports',
    emoji: '✈️',
    lines: [
      'Techo International (KTI) — Phnom Penh, ~20 km from the city',
      'Siem Reap-Angkor (SAI) — about an hour by road to town',
      'Sihanouk International (KOS) — islands & Kampot'
    ]
  },
  {
    title: 'Seasons',
    emoji: '🌦️',
    lines: [
      'Nov–Feb: cool & dry, peak season',
      'Mar–May: hottest, low-to-mid 30s °C',
      'Jun–Oct: green season, daily showers, wettest in September'
    ]
  },
  {
    title: 'Getting around',
    emoji: '🛺',
    lines: [
      'Buses & minivans between cities; Phnom Penh–Siem Reap ~6 h',
      'Royal Railway train to Kampot and Sihanoukville',
      'Domestic flights Phnom Penh ↔ Siem Reap'
    ]
  },
  {
    title: 'Stay safe',
    emoji: '🛡️',
    lines: [
      'Stay on marked paths in rural areas — landmines remain in places',
      'Watch bags in cities — snatching from motorbikes happens',
      'Do not touch heads or point feet at people or Buddha images'
    ]
  }
]
