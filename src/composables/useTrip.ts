import { ref, computed, watch, nextTick } from 'vue'
import type { Trip, Member, Currency } from '../types/trip'
import { extractTripFromUrl } from '../utils/encoding'
import { generateDateRange } from '../utils/dates'

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
  itinerary: []
})

export const useTrip = () => {
  const trip = ref<Trip>(createEmptyTrip())
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const loadedFromUrl = ref(false)
  const hasUnsavedEdits = ref(false)
  let suppressEditTrack = false

  // Load trip from URL on mount
  const loadTripFromUrl = async () => {
    try {
      const urlTrip = extractTripFromUrl()
      if (urlTrip) {
        suppressEditTrack = true
        trip.value = urlTrip
        loadedFromUrl.value = true
        // Update URL without the trip parameter
        window.history.replaceState({}, '', window.location.pathname)
        await nextTick()
        suppressEditTrack = false
      }
    } catch (err) {
      error.value = 'Failed to load trip from URL'
      console.error(err)
    }
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

  // Generate itinerary dates when dates change
  const updateItineraryDates = () => {
    if (trip.value.startDate && trip.value.endDate) {
      const dateRange = generateDateRange(trip.value.startDate, trip.value.endDate)
      
      // Adjust existing itinerary to match new date range
      const updatedItinerary = dateRange.map((date, index) => {
        const existingDay = trip.value.itinerary[index]
        return existingDay
          ? { ...existingDay, dayNumber: index + 1, date }
          : { dayNumber: index + 1, date, activities: [] }
      })
      
      trip.value.itinerary = updatedItinerary
    }
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
      id: Date.now().toString(),
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
    return trip.value.budget.contributions.reduce((sum, contribution) => {
      // Convert to budget currency if needed
      if (contribution.currency === trip.value.budget.currency) {
        return sum + contribution.amount
      }
      // Simple conversion - in real app would use currency utility
      return sum + contribution.amount
    }, 0)
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
    
    if (existingIndex >= 0) {
      trip.value.budget.contributions[existingIndex] = { memberId, amount, currency }
    } else {
      trip.value.budget.contributions.push({ memberId, amount, currency })
    }
  }

  const getContributionForMember = (memberId: string) => {
    return trip.value.budget.contributions.find(c => c.memberId === memberId)
  }

  // Reset trip
  const resetTrip = () => {
    trip.value = createEmptyTrip()
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
    resetTrip,
    exportTrip,
    importTrip
  }
}
