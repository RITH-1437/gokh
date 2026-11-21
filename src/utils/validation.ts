import type { Trip, Member } from '../types/trip'
import { parseISODate, isValidISODate, MAX_TRIP_DAYS } from './dates'
import { convertCurrency } from './currency'

export interface ValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
}

export const validateTrip = (trip: Trip): ValidationResult => {
  const warnings: string[] = []
  const errors: string[] = []

  // Trip name
  if (!trip.tripName.trim()) {
    warnings.push('Add a trip name to personalize your trip')
  }

  // Destination
  if (!trip.destination.trim()) {
    errors.push('Please select a destination')
  }

  // Dates
  if (!trip.startDate || !trip.endDate) {
    errors.push('Please select start and end dates')
  } else {
    const start = parseISODate(trip.startDate)
    const end = parseISODate(trip.endDate)
    if (end < start) {
      errors.push('End date cannot be before start date')
    }
  }

  // Members
  if (trip.members.length === 0) {
    warnings.push('Add travelers to your trip')
  } else {
    const leader = trip.members.find(m => m.role === 'leader')
    if (!leader) {
      errors.push('Trip must have a leader')
    }
  }

  // Transportation
  if (!trip.transportation.type) {
    warnings.push('Select transportation for your trip')
  }

  // Accommodation
  if (!trip.accommodation.type) {
    warnings.push('Select accommodation for your trip')
  }

  // Budget
  if (trip.budget.total <= 0) {
    warnings.push('Set a budget to track expenses')
  } else if (trip.members.length > 0) {
    const totalContributed = trip.budget.contributions.reduce(
      (sum, c) => sum + convertCurrency(c.amount, c.currency, trip.budget.currency),
      0
    )
    if (totalContributed === 0) {
      warnings.push('Add budget contributions from travelers')
    } else if (totalContributed < trip.budget.total) {
      warnings.push(`${((trip.budget.total - totalContributed) / trip.budget.total * 100).toFixed(0)}% of budget not yet contributed`)
    } else if (totalContributed > trip.budget.total) {
      warnings.push(`Contributions exceed budget by ${((totalContributed - trip.budget.total) / trip.budget.total * 100).toFixed(0)}%`)
    }
  }

  // Itinerary
  if (trip.itinerary.length === 0) {
    warnings.push('Plan your daily itinerary')
  } else {
    const emptyDays = trip.itinerary.filter(day => day.activities.length === 0).length
    if (emptyDays > 0) {
      warnings.push(`${emptyDays} day(s) have no activities planned`)
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}

export const validateMember = (name: string, members: Member[]): ValidationResult => {
  const warnings: string[] = []
  const errors: string[] = []

  if (!name.trim()) {
    errors.push('Member name cannot be empty')
  }

  if (name.length > 50) {
    warnings.push('Member name is quite long')
  }

  const duplicate = members.find(m => m.name.toLowerCase() === name.toLowerCase())
  if (duplicate) {
    errors.push('A member with this name already exists')
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}

export const validateBudget = (amount: number, currency: string): ValidationResult => {
  const warnings: string[] = []
  const errors: string[] = []

  if (amount < 0) {
    errors.push('Budget cannot be negative')
  } else if (amount === 0) {
    errors.push('Budget must be greater than 0')
  }

  if (amount > 1000000 && currency === 'USD') {
    warnings.push('This is a very large budget for a Cambodia trip')
  }

  if (amount > 1000000000 && currency === 'KHR') {
    warnings.push('This is a very large budget for a Cambodia trip')
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}

export const validateContribution = (amount: number, memberCount: number, totalBudget: number): ValidationResult => {
  const warnings: string[] = []
  const errors: string[] = []

  if (amount < 0) {
    errors.push('Contribution cannot be negative')
  }

  if (amount > totalBudget && totalBudget > 0) {
    warnings.push('This contribution exceeds the total budget')
  }

  if (memberCount > 1 && amount > totalBudget / memberCount * 2 && totalBudget > 0) {
    warnings.push('This contribution is significantly higher than the average')
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}

export const validateDateRange = (startDate: string, endDate: string): ValidationResult => {
  const warnings: string[] = []
  const errors: string[] = []

  if (!startDate || !endDate) {
    errors.push('Both start and end dates are required')
    return { isValid: false, warnings, errors }
  }

  if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
    errors.push('Invalid date format')
    return { isValid: false, warnings, errors }
  }

  const start = parseISODate(startDate)
  const end = parseISODate(endDate)

  if (end < start) {
    errors.push('End date cannot be before start date')
  }

  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays + 1 > MAX_TRIP_DAYS) {
    errors.push(`Trips can be up to ${MAX_TRIP_DAYS} days long`)
  } else if (diffDays > 30) {
    warnings.push('Trip duration is quite long (over 30 days)')
  }

  if (diffDays === 0) {
    warnings.push('Same-day trip - ensure this is intentional')
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}

export const getTripCompletionPercentage = (trip: Trip): number => {
  let completed = 0
  let total = 8 // Total number of required fields

  if (trip.tripName.trim()) completed++
  if (trip.destination.trim()) completed++
  if (trip.startDate && trip.endDate) completed++
  if (trip.members.length > 0) completed++
  if (trip.transportation.type) completed++
  if (trip.accommodation.type) completed++
  if (trip.budget.total > 0) completed++
  if (trip.itinerary.length > 0 && trip.itinerary.some(day => day.activities.length > 0)) completed++

  return Math.round((completed / total) * 100)
}
