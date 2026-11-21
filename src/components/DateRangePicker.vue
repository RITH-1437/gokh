<template>
  <div>
    <div class="flex items-stretch gap-2.5 sm:gap-5">
      <!-- Start tile -->
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-semibold text-ink-soft mb-2">Start</p>
        <button
          type="button"
          aria-label="Pick start date"
          class="w-full flex flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-stone-200/80 bg-white px-2 py-4 sm:py-5 transition-all duration-200 hover:border-cambodia-300 hover:-translate-y-0.5 hover:shadow-soft focus-ring active:scale-[.98]"
          @click="pick('start')"
        >
          <span class="text-4xl sm:text-6xl font-extrabold text-ink leading-none tnum">
            {{ startTile?.day || '–' }}
          </span>
          <span class="mt-1.5 text-[12px] sm:text-sm font-bold text-sand-600 tracking-[0.14em]">
            {{ startTile?.month || 'MONTH' }}
          </span>
          <span class="text-[11px] sm:text-[13px] text-ink-mute">
            {{ startTile?.weekday || 'Pick a date' }}
          </span>
        </button>
      </div>

      <!-- Connector -->
      <div class="flex flex-col items-center justify-center">
        <span class="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 mb-2 hidden sm:block">to</span>
        <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-sand-100 border border-sand-200 text-sand-600 flex items-center justify-center shadow-soft">
          <Icon name="arrow-right" :size="18" />
        </div>
      </div>

      <!-- End tile -->
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-semibold text-ink-soft mb-2">End</p>
        <button
          type="button"
          aria-label="Pick end date"
          class="w-full flex flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-stone-200/80 bg-white px-2 py-4 sm:py-5 transition-all duration-200 hover:border-cambodia-300 hover:-translate-y-0.5 hover:shadow-soft focus-ring active:scale-[.98]"
          @click="pick('end')"
        >
          <span class="text-4xl sm:text-6xl font-extrabold text-ink leading-none tnum">
            {{ endTile?.day || '–' }}
          </span>
          <span class="mt-1.5 text-[12px] sm:text-sm font-bold text-sand-600 tracking-[0.14em]">
            {{ endTile?.month || 'MONTH' }}
          </span>
          <span class="text-[11px] sm:text-[13px] text-ink-mute">
            {{ endTile?.weekday || 'Pick a date' }}
          </span>
        </button>
      </div>
    </div>

    <!-- Days until the trip starts -->
    <div v-if="daysUntilStart !== null" class="mt-3 flex items-center justify-center animate-slide-down">
      <div class="inline-flex items-center gap-2 rounded-full bg-sand-100 border border-sand-200 text-sand-800 px-4 py-1.5 shadow-soft">
        <span class="text-[13px] font-bold tnum">
          <template v-if="daysUntilStart === 0">Your trip starts today!</template>
          <template v-else-if="daysUntilStart === 1">1 day to go — starts tomorrow</template>
          <template v-else>{{ daysUntilStart }} days to go until the start</template>
        </span>
      </div>
    </div>

    <!-- Hidden native date inputs -->
    <input
      ref="startInput"
      v-model="startDate"
      type="date"
      :min="minDate"
      class="sr-only"
      aria-label="Start date"
    />
    <input
      ref="endInput"
      v-model="endDate"
      type="date"
      :min="startDate || minDate"
      :max="maxEndDate"
      class="sr-only"
      aria-label="End date"
    />

    <!-- Duration -->
    <div v-if="duration" class="mt-4 flex items-center justify-center gap-2 animate-slide-down">
      <div class="inline-flex items-center gap-2 rounded-full bg-cambodia-600 text-white px-4 py-2 shadow-glow">
        <span class="text-sm font-bold tnum">
          {{ duration.days }} day{{ duration.days > 1 ? 's' : '' }}
        </span>
        <span class="text-white/50">·</span>
        <span class="text-sm font-bold tnum">{{ duration.nights }} night{{ duration.nights > 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Friendly validation -->
    <div v-if="errorMessage" class="mt-3">
      <WarningAlert variant="error" :message="errorMessage" dismissible @dismiss="errorMessage = ''" />
    </div>
    <div v-if="durationWarning" class="mt-3">
      <WarningAlert variant="warning" :message="durationWarning" dismissible @dismiss="durationWarning = ''" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatDateTile, calculateDuration, isValidDateRange, todayISO, parseISODate, MAX_TRIP_DAYS } from '../utils/dates'
import { validateDateRange } from '../utils/validation'
import WarningAlert from './WarningAlert.vue'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  startDate: string
  endDate: string
}>()

const emit = defineEmits<{
  'update:startDate': [value: string]
  'update:endDate': [value: string]
}>()

// The picker is fully controlled by its props. It previously copied props into
// local refs once, so a trip loaded from a share link (or reset) never showed
// up here, and picking one date re-emitted the other as an empty string.
const startDate = computed({
  get: () => props.startDate,
  set: (value: string) => {
    emit('update:startDate', value)
    // Moving the start past the end clears the end so the range stays valid.
    if (value && props.endDate && !isValidDateRange(value, props.endDate)) {
      emit('update:endDate', '')
    }
  }
})
const endDate = computed({
  get: () => props.endDate,
  set: (value: string) => emit('update:endDate', value)
})
const errorMessage = ref('')
const durationWarning = ref('')
const minDate = todayISO()

// Last selectable end date: start + MAX_TRIP_DAYS - 1.
const maxEndDate = computed(() => {
  if (!startDate.value) return undefined
  const start = parseISODate(startDate.value)
  const last = new Date(start.getFullYear(), start.getMonth(), start.getDate() + MAX_TRIP_DAYS - 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`
})

const startInput = ref<HTMLInputElement>()
const endInput = ref<HTMLInputElement>()

const startTile = computed(() => (startDate.value ? formatDateTile(startDate.value) : null))
const endTile = computed(() => (endDate.value ? formatDateTile(endDate.value) : null))

const duration = computed(() => {
  if (!startDate.value || !endDate.value) return null
  if (validateDateRange(startDate.value, endDate.value).errors.length) return null
  return calculateDuration(startDate.value, endDate.value)
})

const daysUntilStart = computed(() => {
  if (!startDate.value) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = parseISODate(startDate.value)
  start.setHours(0, 0, 0, 0)
  const diff = Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff < 0 ? null : diff
})

const pick = (which: 'start' | 'end') => {
  const input = which === 'start' ? startInput.value : endInput.value
  if (!input) return
  if (typeof (input as HTMLInputElement).showPicker === 'function') {
    ;(input as HTMLInputElement).showPicker()
  } else {
    input.focus()
  }
}

watch([startDate, endDate], () => {
  if (startDate.value && endDate.value) {
    const validation = validateDateRange(startDate.value, endDate.value)
    errorMessage.value = validation.isValid ? '' : validation.errors[0] || ''
    durationWarning.value = validation.warnings[0] || ''
  } else {
    errorMessage.value = ''
    durationWarning.value = ''
  }
}, { immediate: true })
</script>