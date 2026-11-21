import { ref, computed, watch, nextTick } from 'vue'
import type { Trip, Member, Currency } from '../types/trip'
import { readTripFromUrl } from '../utils/encoding'
import { generateDateRange, isValidDateRange, daysBetweenInclusive, MAX_TRIP_DAYS } from '../utils/dates'
import { convertCurrency } from '../utils/currency'
import { createId } from '../utils/id'
import { loadSavedTrip, saveTrip, clearSavedTrip } from '../utils/storage'

export type TripLoadStatus = 'loaded' | 'invalid' | 'none'

export interface UseTripOptions {
  /** Persist the trip to localStorage and allow restoring it on reload. */
  persist?: boolean
}

const createEmptyTrip = (): Trip => ({
  tripName: '',
  destination: '',
  members: [],
  startDate: '',
  endDate: '',
  transportation: {
    type: 'motorcycle',
    note: ''
  },
  accommodation: {
    type: 'hotel',
    name: ''
  },
  budget: {
    total: 0,
    currency: 'USD',
    contributions: []
  },
  itinerary: [],
  checklist: []
})

// True when nothing meaningful has been entered yet.
export const isTripEmpty = (t: Trip): boolean =>
  !t.tripName.trim() &&
  !t.destination.trim() &&
  t.members.length === 0 &&
  !t.startDate &&
  !t.endDate &&
  t.budget.total <= 0 &&
  t.itinerary.every(d => d.activities.length === 0)

export const useTrip = (options: UseTripOptions = {}) => {
  const trip = ref<Trip>(createEmptyTrip())
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const loadedFromUrl = ref(false)
  const hasUnsavedEdits = ref(false)
  let suppressEditTrack = false

  // Replace the whole trip without counting it as a user edit.
  const replaceTrip = async (next: Trip) => {
    suppressEditTrack = true
    trip.value = next
    await nextTick()
    suppressEditTrack = false
  }

  // Load a shared trip from `?trip=`. Resolves to 'invalid' for a broken or
  // tampered link (the param is removed either way so a refresh is clean).
  const loadTripFromUrl = async (): Promise<TripLoadStatus> => {
    try {
      const result = readTripFromUrl()
      if (result.status === 'none') return 'none'
      window.history.replaceState({}, '', window.location.pathname)
      if (result.status === 'invalid') {
        error.value = 'This share link is broken or incomplete'
        return 'invalid'
      }
      loadedFromUrl.value = true
      await replaceTrip(result.trip)
      return 'loaded'
    } catch (err) {
      error.value = 'Failed to load trip from URL'
      console.error(err)
      return 'invalid'
    }
  }

  // Restore the locally saved draft (if persistence is enabled).
  const restoreSavedTrip = async (): Promise<boolean> => {
    if (!options.persist) return false
    const saved = loadSavedTrip()
    if (!saved || isTripEmpty(saved)) return false
    await replaceTrip(saved)
    return true
  }

  if (options.persist) {
    let saveTimer: ReturnType<typeof setTimeout> | undefined
    watch(
      trip,
      value => {
        clearTimeout(saveTimer)
        saveTimer = setTimeout(() => saveTrip(value), 250)
      },
      { deep: true }
    )
  }

  const clearSharedTripFlag = () => {
    loadedFromUrl.value = false
    hasUnsavedEdits.value = false
  }

  // Track edits made after a trip was loaded from a shared URL
  watch(
    trip,
    () => {
      if (!suppressEditTrack && loadedFromUrl.value) {
        hasUnsavedEdits.value = true
      }
    },
    { deep: true }
  )

  // Generate itinerary dates when dates change. An invalid or oversized range
  // leaves the itinerary untouched — previously an end date before the start
  // date produced an empty range and silently deleted every planned activity.
  const updateItineraryDates = () => {
    const { startDate, endDate } = trip.value
    if (!isValidDateRange(startDate, endDate)) return
    if (daysBetweenInclusive(startDate, endDate) > MAX_TRIP_DAYS) return

    // Day N keeps its activities; days beyond the new range are dropped.
    trip.value.itinerary = generateDateRange(startDate, endDate).map((date, index) => {
      const existingDay = trip.value.itinerary[index]
      return existingDay
        ? { ...existingDay, dayNumber: index + 1, date }
        : { dayNumber: index + 1, date, activities: [] }
    })
  }

  // Watch for date changes
  watch(() => [trip.value.startDate, trip.value.endDate], async () => {
    suppressEditTrack = true
    updateItineraryDates()
    await nextTick()
    suppressEditTrack = false
  }, { deep: true })

  // Member management
  const addMember = (name: string, role: 'leader' | 'member' = 'member') => {
    const newMember: Member = {
      id: createId(),
      name,
      role
    }
    
    // If this is the first member, make them leader
    if (trip.value.members.length === 0) {
      newMember.role = 'leader'
    }
    
    // If adding a leader, demote existing leader
    if (role === 'leader') {
      trip.value.members = trip.value.members.map(m => ({
        ...m,
        role: m.role === 'leader' ? 'member' : m.role
      }))
    }
    
    trip.value.members.push(newMember)
  }

  const removeMember = (memberId: string) => {
    const memberToRemove = trip.value.members.find(m => m.id === memberId)
    
    // Remove the member
    trip.value.members = trip.value.members.filter(m => m.id !== memberId)
    
    // Remove their contributions
    trip.value.budget.contributions = trip.value.budget.contributions.filter(
      c => c.memberId !== memberId
    )
    
    // If we removed the leader and there are still members, assign a new leader
    if (memberToRemove?.role === 'leader' && trip.value.members.length > 0) {
      trip.value.members[0].role = 'leader'
    }
  }

  const updateMember = (memberId: string, updates: Partial<Member>) => {
    const memberIndex = trip.value.members.findIndex(m => m.id === memberId)
    if (memberIndex === -1) return
    
    // If setting a new leader, demote existing leader
    if (updates.role === 'leader') {
      trip.value.members = trip.value.members.map(m => ({
        ...m,
        role: m.id === memberId ? 'leader' : (m.role === 'leader' ? 'member' : m.role)
      }))
    } else {
      trip.value.members[memberIndex] = { ...trip.value.members[memberIndex], ...updates }
    }
  }

  const getLeader = computed(() => trip.value.members.find(m => m.role === 'leader'))
  const getMembers = computed(() => trip.value.members.filter(m => m.role === 'member'))

  // Budget calculations
  const totalContributed = computed(() => {
    const target = trip.value.budget.currency
    return trip.value.budget.contributions.reduce(
      (sum, c) => sum + convertCurrency(c.amount, c.currency, target),
      0
    )
  })

  const remainingBudget = computed(() => {
    return trip.value.budget.total - totalContributed.value
  })

  const isOverBudget = computed(() => {
    return totalContributed.value > trip.value.budget.total
  })

  const budgetStatus = computed(() => {
    if (isOverBudget.value) {
      return 'over'
    } else if (totalContributed.value === trip.value.budget.total) {
      return 'funded'
    } else if (totalContributed.value > 0) {
      return 'partial'
    }
    return 'empty'
  })

  const perPersonBudget = computed(() => {
    const memberCount = trip.value.members.length
    if (memberCount === 0) return 0
    return trip.value.budget.total / memberCount
  })

  // Contribution management
  const updateContribution = (memberId: string, amount: number, currency: Currency) => {
    const existingIndex = trip.value.budget.contributions.findIndex(
      c => c.memberId === memberId
    )
    
    // Negative or non-numeric amounts are never stored.
    amount = Number.isFinite(amount) && amount > 0 ? amount : 0
    if (existingIndex >= 0) {
      trip.value.budget.contributions[existingIndex] = { memberId, amount, currency }
    } else {
      trip.value.budget.contributions.push({ memberId, amount, currency })
    }
  }

  const getContributionForMember = (memberId: string) => {
    return trip.value.budget.contributions.find(c => c.memberId === memberId)
  }

  // Shared pre-trip checklist
  const toggleChecklistItem = (id: string) => {
    const done = trip.value.checklist ?? []
    trip.value.checklist = done.includes(id) ? done.filter(x => x !== id) : [...done, id]
  }

  // Reset trip
  const resetTrip = () => {
    trip.value = createEmptyTrip()
    loadedFromUrl.value = false
    hasUnsavedEdits.value = false
    if (options.persist) clearSavedTrip()
  }

  // Export trip for sharing
  const exportTrip = () => {
    return { ...trip.value }
  }

  // Import trip
  const importTrip = (importedTrip: Trip) => {
    trip.value = importedTrip
  }

  return {
    trip,
    isLoading,
    error,
    loadedFromUrl,
    hasUnsavedEdits,
    loadTripFromUrl,
    restoreSavedTrip,
    clearSharedTripFlag,
    addMember,
    removeMember,
    updateMember,
    getLeader,
    getMembers,
    totalContributed,
    remainingBudget,
    isOverBudget,
    budgetStatus,
    perPersonBudget,
    updateContribution,
    getContributionForMember,
    toggleChecklistItem,
    resetTrip,
    exportTrip,
    importTrip
  }
}
