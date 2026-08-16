// Parse an ISO date string (YYYY-MM-DD) as a local date to avoid
// timezone shifting when formatting.
export const parseISODate = (date: string): Date => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

const pad = (n: number) => String(n).padStart(2, '0')

export const formatDate = (date: string): string => {
  if (!date) return ''
  const d = parseISODate(date)
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const formatDateShort = (date: string): string => {
  if (!date) return ''
  const d = parseISODate(date)
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short'
  })
}

// "5 Sep → 7 Sep"
export const formatTripRange = (startDate: string, endDate: string): string => {
  if (!startDate || !endDate) return ''
  return `${formatDateShort(startDate)} → ${formatDateShort(endDate)}`
}

// Big date tile: { day: "05", month: "SEP", weekday: "Saturday" }
export const formatDateTile = (date: string): { day: string; month: string; weekday: string } => {
  const d = parseISODate(date)
  return {
    day: pad(d.getDate()),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' })
  }
}

// "05 SEP 2026"
export const formatDayStamp = (date: string): string => {
  const d = parseISODate(date)
  return `${pad(d.getDate())} ${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${d.getFullYear()}`
}

export const calculateDuration = (startDate: string, endDate: string): { days: number; nights: number } => {
  if (!startDate || !endDate) return { days: 0, nights: 0 }
  const start = parseISODate(startDate)
  const end = parseISODate(endDate)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return {
    days: diffDays + 1,
    nights: diffDays >= 0 ? diffDays : 0
  }
}

export const generateDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = []
  const start = parseISODate(startDate)
  const end = parseISODate(endDate)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  const current = new Date(start)
  while (current <= end) {
    dates.push(`${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`)
    current.setDate(current.getDate() + 1)
  }
  return dates
}

export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return false
  const start = parseISODate(startDate)
  const end = parseISODate(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false
  return end >= start
}

export const getDayName = (date: string): string => {
  if (!date) return ''
  return parseISODate(date).toLocaleDateString('en-US', { weekday: 'long' })
}

export const todayISO = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}