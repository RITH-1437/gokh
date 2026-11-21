import { describe, it, expect } from 'vitest'
import {
  isValidISODate,
  daysBetweenInclusive,
  generateDateRange,
  calculateDuration,
  isValidDateRange,
  MAX_TRIP_DAYS
} from './dates'
import { parseAmountInput, convertCurrency, formatCurrency, formatNumber } from './currency'
import { validateDateRange, validateTrip, validateMember, getTripCompletionPercentage } from './validation'
import type { Trip } from '../types/trip'

describe('dates', () => {
  it('validates strict calendar dates', () => {
    expect(isValidISODate('2026-02-28')).toBe(true)
    expect(isValidISODate('2028-02-29')).toBe(true)
    expect(isValidISODate('2026-02-29')).toBe(false)
    expect(isValidISODate('2026-2-1')).toBe(false)
    expect(isValidISODate('')).toBe(false)
    expect(isValidISODate(undefined)).toBe(false)
  })

  it('counts days inclusively, including across month ends', () => {
    expect(daysBetweenInclusive('2026-12-30', '2027-01-02')).toBe(4)
    expect(daysBetweenInclusive('2026-12-01', '2026-12-01')).toBe(1)
  })

  it('generates a date range', () => {
    expect(generateDateRange('2026-12-30', '2027-01-01')).toEqual(['2026-12-30', '2026-12-31', '2027-01-01'])
    expect(generateDateRange('2026-12-05', '2026-12-01')).toEqual([])
  })

  it('computes duration and range validity', () => {
    expect(calculateDuration('2026-12-01', '2026-12-03')).toEqual({ days: 3, nights: 2 })
    expect(isValidDateRange('2026-12-03', '2026-12-01')).toBe(false)
  })
})

describe('currency', () => {
  it('parses typed amounts safely', () => {
    expect(parseAmountInput('1,250.50')).toBe(1250.5)
    expect(parseAmountInput('$300')).toBe(300)
    expect(parseAmountInput('-5')).toBe(5) // the minus sign is ignored, never negative
    expect(parseAmountInput('abc')).toBe(0)
    expect(parseAmountInput('')).toBe(0)
    expect(parseAmountInput('9'.repeat(30))).toBe(1_000_000_000_000)
  })

  it('converts and formats', () => {
    expect(convertCurrency(25, 'USD', 'KHR')).toBe(100000)
    expect(convertCurrency(100000, 'KHR', 'USD')).toBe(25)
    expect(formatCurrency(12.5, 'USD')).toBe('$12.50')
    expect(formatCurrency(100, 'USD')).toBe('$100')
    expect(formatCurrency(400000, 'KHR')).toBe('400,000 KHR')
    expect(formatNumber(1234567.8, 'KHR')).toBe('1,234,568')
  })
})

describe('validation', () => {
  it('rejects reversed and over-long ranges', () => {
    expect(validateDateRange('2026-12-05', '2026-12-01').errors).toContain('End date cannot be before start date')
    expect(validateDateRange('2026-01-01', '2026-12-31').errors[0]).toMatch(`${MAX_TRIP_DAYS} days`)
    expect(validateDateRange('2026-01-01', '2026-02-15').warnings[0]).toMatch(/over 30 days/)
    expect(validateDateRange('2026-12-01', '2026-12-01').warnings[0]).toMatch(/Same-day/)
  })

  it('catches duplicate member names case-insensitively', () => {
    const members = [{ id: '1', name: 'Dara', role: 'leader' as const }]
    expect(validateMember('dara', members).isValid).toBe(false)
    expect(validateMember('Sophea', members).isValid).toBe(true)
  })

  it('converts mixed-currency contributions when checking funding', () => {
    const trip: Trip = {
      tripName: 'T',
      destination: 'Kep',
      members: [{ id: '1', name: 'A', role: 'leader' }],
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      transportation: { type: 'bus' },
      accommodation: { type: 'hotel' },
      budget: { total: 100, currency: 'USD', contributions: [{ memberId: '1', amount: 400000, currency: 'KHR' }] },
      itinerary: [{ dayNumber: 1, date: '2026-12-01', activities: [{ id: 'a', name: 'Crab market' }] }]
    }
    // 400,000 KHR == $100 -> fully funded, no funding warning
    const result = validateTrip(trip)
    expect(result.isValid).toBe(true)
    expect(result.warnings).toEqual([])
    expect(getTripCompletionPercentage(trip)).toBe(100)
  })
})
