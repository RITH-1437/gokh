<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import HeroSection from './components/HeroSection.vue'
import TripProgress from './components/TripProgress.vue'
import SectionShell from './components/SectionShell.vue'
import Reveal from './components/Reveal.vue'
import Emoji3D from './components/Emoji3D.vue'
import Icon from './components/icons/Icon.vue'
import ToastContainer from './components/ToastContainer.vue'
import DestinationSelector from './components/DestinationSelector.vue'
import MemberManager from './components/MemberManager.vue'
import DateRangePicker from './components/DateRangePicker.vue'
import TransportationSelector from './components/TransportationSelector.vue'
import AccommodationSelector from './components/AccommodationSelector.vue'
import BudgetManager from './components/BudgetManager.vue'
import ContributionManager from './components/ContributionManager.vue'
import ItineraryPlanner from './components/ItineraryPlanner.vue'
import TripPreview from './components/TripPreview.vue'
import ShareTrip from './components/ShareTrip.vue'
import BeforeYouGo from './components/BeforeYouGo.vue'
import { useTrip } from './composables/useTrip'
import { useWeather } from './composables/useWeather'
import { useTripShare } from './composables/useTripShare'
import { useToasts } from './composables/useToasts'
import { findDestination } from './data/destinations'
import { ROUTE_TEMPLATES, planRouteTemplate } from './data/routes'
import { PRE_TRIP_CHECKLIST } from './data/essentials'
import type { Activity } from './types/trip'
import { formatTripRange, parseISODate } from './utils/dates'
import { formatCurrency } from './utils/currency'
import { createId } from './utils/id'

const {
  trip,
  loadTripFromUrl,
  restoreSavedTrip,
  loadedFromUrl,
  hasUnsavedEdits,
  clearSharedTripFlag,
  addMember,
  removeMember,
  updateMember,
  totalContributed,
  isOverBudget,
  perPersonBudget,
  updateContribution,
  toggleChecklistItem,
  resetTrip
} = useTrip({ persist: true })

const {
  weather,
  isLoading: weatherLoading,
  error: weatherError,
  fetchWeather,
  clear: clearWeather
} = useWeather()

const { shareTrip, error: shareError } = useTripShare()
const toasts = useToasts()

const isSharing = ref(false)

// Auto-name the trip from the destination until the user edits it manually
const nameAutoSet = ref(false)
const updateTripName = (name: string) => {
  trip.value.tripName = name
  nameAutoSet.value = false
}

watch(
  () => trip.value.destination,
  (destination) => {
    if (!destination) {
      nameAutoSet.value = false
      return
    }
    const dest = findDestination(destination)
    if (!dest?.suggestedName) return
    if (!trip.value.tripName.trim() || nameAutoSet.value) {
      trip.value.tripName = dest.suggestedName
      nameAutoSet.value = true
    }
  }
)

// On start-up a shared link wins; otherwise restore the local draft.
onMounted(async () => {
  const status = await loadTripFromUrl()
  if (status === 'invalid') {
    toasts.error('This share link is broken', 'It may have been cut off when copied. Ask for the link again.', 6000)
  }
  if (status !== 'loaded' && (await restoreSavedTrip())) {
    toasts.info('Welcome back', 'We restored the trip you were planning.')
  }
})

// Fetch weather when trip context changes
watch(
  () => [trip.value.destination, trip.value.startDate, trip.value.endDate],
  ([destination, startDate, endDate]) => {
    if (destination && startDate && endDate) {
      fetchWeather(destination, startDate, endDate)
    } else {
      clearWeather()
    }
  },
  { deep: true }
)

// Progress steps
const steps = computed(() => [
  { key: 'where', label: 'Where', done: !!trip.value.destination },
  { key: 'who', label: 'Who', done: trip.value.members.length > 0 },
  { key: 'when', label: 'When', done: !!(trip.value.startDate && trip.value.endDate) },
  { key: 'how', label: 'Travel', done: !!trip.value.transportation.type },
  { key: 'stay', label: 'Stay', done: !!trip.value.accommodation.type },
  { key: 'budget', label: 'Budget', done: trip.value.budget.total > 0 },
  { key: 'plan', label: 'Plan', done: trip.value.itinerary.some(d => d.activities.length > 0) }
])

const SECTION_IDS: Record<string, string> = {
  where: 'step-where',
  who: 'step-who',
  when: 'step-when',
  how: 'step-how',
  stay: 'step-stay',
  budget: 'step-budget',
  plan: 'step-plan'
}

const currentKey = computed(() => steps.value.find(s => !s.done)?.key || 'plan')

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const navigateToStep = (key: string) => scrollTo(SECTION_IDS[key])

// Jump to the first incomplete step (used by share / itinerary empty states)
const completeTrip = () => {
  const next = steps.value.find(s => !s.done)
  scrollTo(next ? SECTION_IDS[next.key] : 'step-plan')
}

const scrollToPreview = () => {
  const id = window.innerWidth >= 1024 ? 'preview' : 'preview-mobile'
  scrollTo(id)
}

// Activities
const handleAddActivity = (dayIndex: number, activity: { name: string; startTime?: string; endTime?: string; description?: string }) => {
  const newActivity: Activity = {
    id: createId(),
    name: activity.name,
    description: activity.description || '',
    startTime: activity.startTime || '',
    endTime: activity.endTime || ''
  }
  trip.value.itinerary[dayIndex].activities.push(newActivity)
  toasts.success('Activity added', `${activity.name} is on the plan`)
}

const handleUpdateActivity = (dayIndex: number, actIndex: number, field: keyof Activity, value: string) => {
  trip.value.itinerary[dayIndex].activities[actIndex][field] = value
}

const handleRemoveActivity = (dayIndex: number, actIndex: number) => {
  const removed = trip.value.itinerary[dayIndex].activities[actIndex]
  trip.value.itinerary[dayIndex].activities.splice(actIndex, 1)
  toasts.info('Activity removed', removed ? `"${removed.name}" is off the plan` : undefined)
}

// Fill empty itinerary days from a route template (never touches planned days).
const handleApplyTemplate = (templateId: string) => {
  const template = ROUTE_TEMPLATES.find(t => t.id === templateId)
  if (!template) return
  const plan = planRouteTemplate(template, trip.value.itinerary.map(d => d.activities.length > 0))
  plan.forEach(({ dayIndex, names }) => {
    trip.value.itinerary[dayIndex].activities.push(
      ...names.map(name => ({ id: createId(), name, description: '', startTime: '', endTime: '' }))
    )
  })
  const tripDays = trip.value.itinerary.length
  const note = template.days.length > tripDays
    ? `Your trip has ${tripDays} day${tripDays > 1 ? 's' : ''}, so we used the first ${tripDays} of ${template.days.length}.`
    : `${plan.length} day${plan.length > 1 ? 's' : ''} planned — edit anything you like.`
  toasts.success(`${template.name} added`, note)
}

const checklistTotal = PRE_TRIP_CHECKLIST.length

// Month used for the destination "good time to go?" hint.
const travelMonth = computed(() =>
  trip.value.startDate ? parseISODate(trip.value.startDate).getMonth() + 1 : new Date().getMonth() + 1
)

const getDirections = (location: string) => {
  if (!location) return
  const dest = findDestination(location)
  const target = dest?.coordinates
    ? `${dest.coordinates.lat},${dest.coordinates.lon}`
    : encodeURIComponent(`${location}, Cambodia`)
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${target}`, '_blank', 'noopener')
}

// Share (header + mobile bar)
const handleShare = async () => {
  if (!trip.value.tripName.trim() && !trip.value.destination.trim()) {
    toasts.warning('Almost there', 'Give your trip a name or pick a destination to share it.')
    return
  }
  isSharing.value = true
  const ok = await shareTrip(trip.value)
  isSharing.value = false
  if (ok) {
    toasts.success('Trip link copied', 'Send it to your friends — they can open and keep planning.')
  } else {
    toasts.error("Couldn't copy the link", shareError.value || 'Please try again.')
  }
}

const handleReset = () => {
  if (window.confirm('Start a fresh trip? This clears everything you have planned.')) {
    resetTrip()
    window.history.replaceState({}, '', window.location.pathname)
    toasts.info('New trip started', 'Let the adventure begin.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Mobile sticky share bar visibility
const scrolledPast = ref(false)
const shareSectionVisible = ref(false)
let shareObserver: IntersectionObserver | null = null
let scrollCleanup: (() => void) | null = null

const onScroll = () => {
  scrolledPast.value = window.scrollY > 560
}

const showStickyShare = computed(() => scrolledPast.value && !shareSectionVisible.value)

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  scrollCleanup = () => window.removeEventListener('scroll', onScroll)

  const el = document.getElementById('share-section')
  if (el && typeof IntersectionObserver !== 'undefined') {
    shareObserver = new IntersectionObserver(
      ([entry]) => { shareSectionVisible.value = entry.isIntersecting },
      { threshold: 0.04 }
    )
    shareObserver.observe(el)
  }
})

onUnmounted(() => {
  scrollCleanup?.()
  shareObserver?.disconnect()
})

const mobileSummary = computed(() => {
  const parts: string[] = []
  if (trip.value.startDate && trip.value.endDate) parts.push(formatTripRange(trip.value.startDate, trip.value.endDate))
  if (trip.value.members.length) parts.push(`${trip.value.members.length} travelers`)
  if (trip.value.budget.total > 0) parts.push(formatCurrency(trip.value.budget.total, trip.value.budget.currency))
  return parts.join(' · ')
})
</script>

<template>
  <div class="min-h-screen relative overflow-x-clip">
    <AppHeader :is-sharing="isSharing" @share="handleShare" />

    <!-- Shared trip indicator -->
    <div
      v-if="loadedFromUrl"
      class="animate-slide-down bg-cambodia-600 text-white"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2.5 text-[13px]">
        <Icon name="link" :size="15" class="flex-none" />
        <span class="flex-1 min-w-0 truncate">
          <template v-if="hasUnsavedEdits">
            <span class="font-bold">Changes ready to share.</span>
            <span class="text-white/80"> Edit and re-share to update your crew.</span>
          </template>
          <template v-else>
            <span class="font-bold">Shared trip.</span>
            <span class="text-white/80"> You're viewing a trip someone shared — edit to make it yours.</span>
          </template>
        </span>
        <button class="flex-none px-2 py-1 rounded-lg hover:bg-white/15 transition-colors font-semibold" @click="clearSharedTripFlag">
          Dismiss
        </button>
      </div>
    </div>

    <main class="relative">
      <HeroSection
        :trip="trip"
        :loaded-from-url="loadedFromUrl"
        @start="scrollTo('step-where')"
        @preview="scrollToPreview"
      />

      <!-- Progress -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <Reveal>
          <TripProgress :steps="steps" :current-key="currentKey" @navigate="navigateToStep" />
        </Reveal>
      </div>

      <!-- Builder + preview -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div class="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-12 lg:gap-14 xl:gap-16">

          <!-- Left: guided journey -->
          <div class="min-w-0 space-y-2">
            <Reveal>
              <SectionShell
                id="step-where"
                :step="1"
                title="Where are you going?"
                subtitle="Pick a place and let's start the adventure."
                :done="!!trip.destination"
              >
                <DestinationSelector v-model="trip.destination" :travel-month="travelMonth" />
              </SectionShell>
            </Reveal>

            <Reveal>
              <SectionShell
                id="step-who"
                :step="2"
                title="Who's coming?"
                subtitle="Build your travel crew."
                :done="trip.members.length > 0"
              >
                <MemberManager
                  :members="trip.members"
                  @add="addMember"
                  @remove="removeMember"
                  @update="updateMember"
                />
              </SectionShell>
            </Reveal>

            <Reveal>
              <SectionShell
                id="step-when"
                :step="3"
                title="When are you going?"
                subtitle="Pick your dates and the plan builds itself."
                :done="!!(trip.startDate && trip.endDate)"
              >
                <DateRangePicker
                  :start-date="trip.startDate"
                  :end-date="trip.endDate"
                  @update:startDate="trip.startDate = $event"
                  @update:endDate="trip.endDate = $event"
                />
              </SectionShell>
            </Reveal>

            <Reveal>
              <SectionShell
                id="step-how"
                :step="4"
                title="How are you getting around?"
                subtitle="Motorcycle, van, or bus — pick your ride."
                :done="!!trip.transportation.type"
              >
                <TransportationSelector v-model="trip.transportation" />
              </SectionShell>
            </Reveal>

            <Reveal>
              <SectionShell
                id="step-stay"
                :step="5"
                title="Where are you staying?"
                subtitle="Pick a place to rest after the adventures."
                :done="!!trip.accommodation.type"
              >
                <AccommodationSelector v-model="trip.accommodation" />
              </SectionShell>
            </Reveal>

            <Reveal>
              <SectionShell
                id="step-budget"
                :step="6"
                title="What's the budget?"
                subtitle="Set the pot and split it with your crew."
                :done="trip.budget.total > 0"
              >
                <div class="space-y-4">
                  <BudgetManager
                    v-model="trip.budget"
                    :total-contributed="totalContributed"
                    :is-over-budget="isOverBudget"
                    :per-person-budget="perPersonBudget"
                  />
                  <ContributionManager
                    v-if="trip.members.length > 0"
                    :members="trip.members"
                    :budget="trip.budget"
                    :per-person-budget="perPersonBudget"
                    @update-contribution="updateContribution"
                  />
                </div>
              </SectionShell>
            </Reveal>

            <Reveal>
              <SectionShell
                id="step-plan"
                :step="7"
                title="What's the plan?"
                subtitle="Build the journey, day by day."
                :done="trip.itinerary.some(d => d.activities.length > 0)"
              >
                <ItineraryPlanner
                  :itinerary="trip.itinerary"
                  :destination="trip.destination"
                  :weather="weather"
                  :weather-loading="weatherLoading"
                  :weather-error="weatherError"
                  @add-activity="handleAddActivity"
                  @update-activity="handleUpdateActivity"
                  @remove-activity="handleRemoveActivity"
                  @directions="getDirections"
                  @choose-dates="scrollTo('step-when')"
                  @apply-template="handleApplyTemplate"
                />
              </SectionShell>
            </Reveal>

            <Reveal>
              <SectionShell
                id="step-prepare"
                :step="8"
                title="Before you go"
                subtitle="Optional — a checklist the whole crew shares, plus the essentials."
                :done="(trip.checklist?.length ?? 0) > 0 && trip.checklist?.length === checklistTotal"
                last
              >
                <BeforeYouGo :checklist="trip.checklist ?? []" @toggle="toggleChecklistItem" />
              </SectionShell>
            </Reveal>

            <!-- Start over -->
            <div class="pl-[44px] sm:pl-[58px] pb-4">
              <button class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-mute hover:text-clay-600 transition-colors" @click="handleReset">
                <Icon name="refresh-cw" :size="14" />
                Start over
              </button>
            </div>
          </div>

          <!-- Right: sticky preview (desktop) -->
          <div id="preview" class="hidden lg:block">
            <div class="lg:sticky lg:top-24 space-y-5">
              <TripPreview :trip="trip" :per-person-budget="perPersonBudget" @update:trip-name="updateTripName" />

              <!-- Directions -->
              <div v-if="trip.destination" class="surface !rounded-2xl p-4 flex items-center gap-3">
                <Emoji3D emoji="🧭" size="sm" shape="tile" />
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-ink text-sm">Get there</div>
                  <div class="text-[12px] text-ink-mute truncate">{{ trip.destination }}, Cambodia</div>
                </div>
                <button class="btn-ghost !h-10 !px-3.5 text-sm shrink-0" @click="getDirections(trip.destination)">
                  <Icon name="navigation-2" :size="14" />
                  Directions
                </button>
              </div>

              <!-- Share (desktop) -->
              <ShareTrip :trip="trip" @complete-trip="completeTrip" />
            </div>
          </div>
        </div>

        <!-- Mobile: preview + share -->
        <div class="lg:hidden mt-10 space-y-5" id="preview-mobile">
          <TripPreview :trip="trip" :per-person-budget="perPersonBudget" @update:trip-name="updateTripName" />

          <div v-if="trip.destination" class="surface !rounded-2xl p-4 flex items-center gap-3">
            <Emoji3D emoji="🧭" size="sm" shape="tile" />
            <div class="flex-1 min-w-0">
              <div class="font-bold text-ink text-sm">Get there</div>
              <div class="text-[12px] text-ink-mute truncate">{{ trip.destination }}, Cambodia</div>
            </div>
            <button class="btn-ghost !h-10 !px-3.5 text-sm shrink-0" @click="getDirections(trip.destination)">
              <Icon name="navigation-2" :size="14" />
              Directions
            </button>
          </div>

          <div id="share-section">
            <ShareTrip :trip="trip" @complete-trip="completeTrip" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-6 pb-24 lg:pb-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-ink-soft text-sm">
            <span class="text-base">🇰🇭</span>
            <span class="font-bold text-ink">GoKH</span>
            <span>— Explore Cambodia together.</span>
          </div>
          <p class="text-[12.5px] text-ink-mute">Plan it. Pack it. Go.</p>
        </div>
      </footer>
    </main>

    <!-- Mobile sticky share bar -->
    <div
      v-if="showStickyShare"
      class="fixed bottom-0 inset-x-0 z-40 lg:hidden animate-slide-up"
    >
      <div class="bg-ivory/90 backdrop-blur-md border-t border-stone-200/70 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lift">
        <div class="flex items-center gap-3 max-w-7xl mx-auto">
          <div class="flex-1 min-w-0">
            <div class="text-[13.5px] font-bold text-ink truncate">
              {{ trip.tripName || trip.destination || 'Plan your trip' }}
            </div>
            <div v-if="mobileSummary" class="text-[11.5px] text-ink-mute truncate tnum">
              {{ mobileSummary }}
            </div>
          </div>
          <button class="btn-gold !h-11 !px-5 shrink-0" :disabled="isSharing" @click="handleShare">
            <Icon v-if="isSharing" name="loader" :size="16" class="animate-spin" />
            <Icon v-else name="link" :size="16" />
            <span>Share trip</span>
          </button>
        </div>
      </div>
    </div>

    <ToastContainer />
  </div>
</template>