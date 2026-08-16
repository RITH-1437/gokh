<template>
  <div class="surface overflow-hidden">
    <!-- Header band -->
    <div class="relative bg-gradient-to-br from-cambodia-700 via-cambodia-800 to-cambodia-900 px-5 sm:px-6 pt-5 pb-5 text-white overflow-hidden">
      <img
        v-if="destImage"
        :src="destImage"
        :alt="trip.destination"
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div class="absolute inset-0 bg-gradient-to-br from-cambodia-800/80 via-cambodia-800/60 to-cambodia-900/90" />
      <div class="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20" style="background: radial-gradient(closest-side, #E2BD76, transparent)" />

      <div class="relative flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-[10px] font-bold tracking-[0.22em] uppercase text-sand-300">
            GoKH · Trip
          </div>

          <!-- Editable trip name -->
          <div v-if="!editingName" class="group mt-1.5 flex items-center gap-2">
            <h3 class="text-xl sm:text-2xl font-extrabold tracking-tight truncate">
              {{ trip.tripName || 'Untitled adventure' }}
            </h3>
            <button
              class="opacity-40 group-hover:opacity-90 hover:text-sand-300 transition-opacity"
              title="Edit trip name"
              aria-label="Edit trip name"
              @click="startEditName"
            >
              <Icon name="edit" :size="14" />
            </button>
          </div>
          <input
            v-else
            v-model="nameDraft"
            type="text"
            class="w-full mt-1 bg-transparent border-b border-sand-300/60 text-xl sm:text-2xl font-extrabold tracking-tight focus:outline-none placeholder:text-white/40"
            placeholder="Name your adventure…"
            @keyup.enter="saveName"
            @keyup.esc="cancelName"
            @blur="saveName"
          />
        </div>
        <span class="flex-none text-xl sm:text-2xl" title="Cambodia">🇰🇭</span>
      </div>

      <!-- Destination + dates -->
      <div class="relative mt-3.5 space-y-1">
        <div class="flex items-center gap-2 text-[15px] font-semibold text-white/95">
          <span class="text-base">📍</span>
          <span>{{ trip.destination || 'Choose a destination' }}</span>
        </div>
        <div v-if="trip.startDate && trip.endDate" class="flex items-center gap-2 text-[13px] text-white/70 tnum">
          <span class="text-sm">🗓️</span>
          <span>{{ formatTripRange(trip.startDate, trip.endDate) }}</span>
          <span class="text-white/40">·</span>
          <span v-if="duration">{{ duration.days }} days · {{ duration.nights }} nights</span>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="px-5 sm:px-6 py-5 space-y-4">
      <!-- Crew -->
      <div class="flex items-center justify-between">
        <div class="flex -space-x-2.5">
          <Avatar
            v-for="member in trip.members.slice(0, 5)"
            :key="member.id"
            :name="member.name"
            :role="member.role"
            size="sm"
          />
          <div
            v-if="trip.members.length > 5"
            class="w-10 h-10 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-[12px] font-bold text-ink-soft"
          >
            +{{ trip.members.length - 5 }}
          </div>
          <div
            v-else-if="trip.members.length === 0"
            class="w-10 h-10 rounded-full bg-ivory border-2 border-dashed border-stone-300 flex items-center justify-center text-ink-mute"
          >
            <Icon name="users" :size="14" />
          </div>
        </div>
        <span class="text-[13px] font-semibold text-ink-mute">
          {{ trip.members.length }} traveler{{ trip.members.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <div class="h-px bg-stone-200/80" />

      <!-- Budget -->
      <div class="flex items-end justify-between">
        <div>
          <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-sand-600">Budget</div>
          <div class="mt-0.5 text-3xl font-extrabold text-ink tnum">
            <span class="text-lg text-ink/60 align-top">{{ symbol }}</span>
            {{ formatNumber(Math.round(animatedTotal * 100) / 100, trip.budget.currency) }}
          </div>
          <div class="text-[12.5px] text-ink-mute">{{ secondaryAmount }}</div>
        </div>
        <div v-if="perPersonBudget > 0" class="text-right">
          <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Per person</div>
          <div class="text-[13px] font-bold text-ink tnum">
            {{ formatCurrency(perPersonBudget, trip.budget.currency) }}
          </div>
        </div>
      </div>

      <!-- Transport · Stay -->
      <div v-if="trip.transportation.type || trip.accommodation.type" class="flex flex-wrap gap-2">
        <span v-if="trip.transportation.type" class="chip !bg-ivory">
          {{ transport.emoji }} {{ transport.label }}
        </span>
        <span v-if="trip.accommodation.type" class="chip !bg-ivory">
          {{ accommodation.emoji }} {{ accommodation.label }}
        </span>
      </div>

      <!-- Itinerary summary -->
      <div v-if="hasItinerary">
        <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-sand-600 mb-2">Itinerary</div>
        <div class="space-y-1.5">
          <div
            v-for="day in trip.itinerary.slice(0, 4)"
            :key="day.dayNumber"
            class="flex items-baseline gap-2 text-[13px]"
          >
            <span class="font-bold text-ink">Day {{ day.dayNumber }}</span>
            <span v-if="day.activities.length" class="text-ink-soft truncate">
              {{ day.activities[0].name }}
              <span v-if="day.activities.length > 1" class="text-ink-mute">+{{ day.activities.length - 1 }}</span>
            </span>
            <span v-else class="text-ink-mute italic">free day</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Trip } from '../types/trip'
import { formatTripRange, calculateDuration } from '../utils/dates'
import { formatCurrency, formatNumber, currencySymbol, USD_TO_KHR } from '../utils/currency'
import { findDestination } from '../data/destinations'
import { useAnimatedNumber } from '../composables/useAnimatedNumber'
import Avatar from './Avatar.vue'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  trip: Trip
  perPersonBudget: number
}>()

const emit = defineEmits<{
  'update:tripName': [value: string]
}>()

const duration = computed(() => {
  if (!props.trip.startDate || !props.trip.endDate) return null
  return calculateDuration(props.trip.startDate, props.trip.endDate)
})

const destImage = computed(() => findDestination(props.trip.destination)?.image)

const transport = computed(() => {
  const map: Record<string, { label: string; emoji: string }> = {
    motorcycle: { label: 'Motorcycle', emoji: '🛵' },
    van: { label: 'Van', emoji: '🚐' },
    bus: { label: 'Bus', emoji: '🚌' }
  }
  return map[props.trip.transportation.type] || { label: '', emoji: '' }
})

const accommodation = computed(() => {
  const map: Record<string, { label: string; emoji: string }> = {
    hotel: { label: 'Hotel', emoji: '🏨' },
    guesthouse: { label: 'Guesthouse', emoji: '🏠' },
    camping: { label: 'Camping', emoji: '⛺' }
  }
  return map[props.trip.accommodation.type] || { label: '', emoji: '' }
})

const hasItinerary = computed(() =>
  props.trip.itinerary.length > 0 && props.trip.itinerary.some(d => d.activities.length > 0)
)

const symbol = computed(() => currencySymbol(props.trip.budget.currency))

const secondaryAmount = computed(() => {
  if (props.trip.budget.total <= 0) return ''
  return props.trip.budget.currency === 'USD'
    ? formatCurrency(props.trip.budget.total * USD_TO_KHR, 'KHR')
    : formatCurrency(props.trip.budget.total / USD_TO_KHR, 'USD')
})

const { value: animatedTotal, set: setAnimatedTotal } = useAnimatedNumber(420)
watch(() => props.trip.budget.total, setAnimatedTotal, { immediate: true })

// Trip name editing
const editingName = ref(false)
const nameDraft = ref('')

const startEditName = () => {
  nameDraft.value = props.trip.tripName
  editingName.value = true
}

const saveName = () => {
  if (editingName.value) {
    emit('update:tripName', nameDraft.value.trim())
    editingName.value = false
  }
}

const cancelName = () => {
  editingName.value = false
}
</script>