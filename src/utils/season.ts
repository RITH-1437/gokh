// Parses best-season strings from the destination catalog ("Nov–Mar",
// "Jun–Dec", "All year") into month numbers (1–12). Ranges may wrap the year.
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

export const parseSeasonMonths = (season: string | undefined): number[] => {
  if (!season) return []
  const text = season.trim().toLowerCase()
  if (text === 'all year') return MONTHS.map((_, i) => i + 1)
  const match = text.match(/^([a-z]{3})\s*[–-]\s*([a-z]{3})$/)
  if (!match) return []
  const from = MONTHS.indexOf(match[1])
  const to = MONTHS.indexOf(match[2])
  if (from === -1 || to === -1) return []
  const months: number[] = []
  for (let m = from; ; m = (m + 1) % 12) {
    months.push(m + 1)
    if (m === to) break
  }
  return months
}

/** null when the season string can't be interpreted. */
export const isInSeason = (season: string | undefined, month: number): boolean | null => {
  const months = parseSeasonMonths(season)
  return months.length ? months.includes(month) : null
}

export const monthName = (month: number): string =>
  new Date(2000, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })
