<template>
  <div>
    <div class="flex items-stretch gap-2.5 sm:gap-5">
      <!-- Start tile -->
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-semibold text-ink-soft mb-2">Start</p>
        <button
          type="button"
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
      class="sr-only"
      aria-label="End date"
    />

    <!-- Duration -->
    <div v-if="duration" class="mt-4 flex items-center justify-center gap-2 animate-slide-down">
      <div class="inline-flex items-center gap-2 rounded-full bg-cambodia-600 text-white px-4 py-2 shadow-glow">
        <span class="text-base">🗓️</span>
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
import { formatDateTile, calculateDuration, isValidDateRange, todayISO } from '../utils/dates'
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

const startDate = ref(props.startDate)
const endDate = ref(props.endDate)
const errorMessage = ref('')
const durationWarning = ref('')
const minDate = todayISO()

const startInput = ref<HTMLInputElement>()
const endInput = ref<HTMLInputElement>()

const startTile = computed(() => (startDate.value ? formatDateTile(startDate.value) : null))
const endTile = computed(() => (endDate.value ? formatDateTile(endDate.value) : null))

const duration = computed(() => {
  if (!startDate.value || !endDate.value) return null
  if (!isValidDateRange(startDate.value, endDate.value)) return null
  return calculateDuration(startDate.value, endDate.value)
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
  emit('update:startDate', startDate.value)
  emit('update:endDate', endDate.value)
}, { immediate: true })
</script>