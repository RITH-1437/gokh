<template>
  <div class="space-y-5">
    <!-- Popular destinations -->
    <div>
      <div class="flex items-end justify-between mb-3">
        <p class="text-[13px] font-bold uppercase tracking-[0.16em] text-sand-600">Popular in Cambodia</p>
        <p class="hidden sm:block text-[12.5px] text-ink-mute">or type any place below</p>
      </div>

      <!-- Mobile: horizontal snap scroll · Desktop: grid -->
      <div class="flex gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:gap-3.5">
        <PhotoChoiceCard
          v-for="dest in popularDestinations"
          :key="dest.name"
          class="snap-start shrink-0 w-[220px] lg:w-auto h-[260px] sm:h-[280px]"
          :title="dest.name"
          :image="dest.image"
          :emoji="dest.emoji"
          :subtitle="dest.tagline"
          :badge="dest.region"
          :meta="dest.days"
          :selected="modelValue === dest.name"
          @select="selectDestination(dest.name)"
        />
      </div>
    </div>

    <!-- Contextual destination panel -->
    <div v-if="selectedDest" class="animate-slide-down surface !rounded-2xl p-5">
      <div class="flex items-center gap-3.5">
        <img
          v-if="selectedDest.image && !imageFailed"
          :src="selectedDest.image"
          :alt="selectedDest.name"
          loading="lazy"
          decoding="async"
          class="w-14 h-14 rounded-2xl object-cover shadow-soft border border-white"
          @error="imageFailed = true"
        />
        <Emoji3D v-else :emoji="selectedDest.emoji || '📍'" size="sm" shape="tile" tone="green" />
        <div>
          <div class="font-extrabold text-ink text-lg leading-tight">{{ selectedDest.name }}</div>
          <div class="text-[13px] text-ink-mute">{{ selectedDest.tagline }}</div>
        </div>
      </div>

      <div v-if="selectedDest.days || selectedDest.bestSeason" class="mt-3 flex flex-wrap gap-2">
        <span v-if="selectedDest.days" class="chip !pointer-events-none !bg-ivory">
          Stay {{ selectedDest.days }}
        </span>
        <span v-if="selectedDest.bestSeason" class="chip !pointer-events-none !bg-ivory">
          Best {{ selectedDest.bestSeason }}
        </span>
      </div>

      <p
        v-if="seasonCheck"
        class="mt-2.5 flex items-center gap-1.5 text-[13px] font-semibold"
        :class="seasonCheck.good ? 'text-cambodia-700' : 'text-sand-700'"
      >
        {{ seasonCheck.text }}
      </p>

      <div
        v-if="selectedDest.advisory"
        role="note"
        class="mt-3 flex items-start gap-2 rounded-xl bg-clay-100 border border-clay-500/20 px-3.5 py-2.5 text-[13px] text-ink-soft leading-snug"
      >
        <Icon name="alert-triangle" :size="15" class="flex-none mt-0.5 text-clay-600" />
        <span><span class="font-bold text-ink">Travel advice.</span> {{ selectedDest.advisory }}</span>
      </div>

      <div v-if="selectedDest.fees?.length" class="mt-4">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sand-600 mb-2">
          Entry fees
        </p>
        <ul class="rounded-xl border border-stone-200/80 divide-y divide-stone-200/70 bg-ivory/60">
          <li v-for="fee in selectedDest.fees" :key="fee.label" class="flex items-start justify-between gap-3 px-3.5 py-2">
            <div class="min-w-0">
              <div class="text-[13px] font-semibold text-ink">{{ fee.label }}</div>
              <div v-if="fee.note" class="text-[12px] text-ink-mute">{{ fee.note }}</div>
            </div>
            <span class="text-[13px] font-bold text-ink tnum shrink-0">{{ fee.price }}</span>
          </li>
        </ul>
        <p class="mt-1.5 text-[11.5px] text-ink-mute">Foreign adult prices, checked {{ FEES_CHECKED }}. Fees change — confirm before you go.</p>
      </div>

      <div v-if="selectedDest.tips?.length" class="mt-4">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sand-600 mb-2">
          Good to know
        </p>
        <ul class="space-y-1.5">
          <li v-for="tip in selectedDest.tips" :key="tip" class="relative pl-3.5 text-[13px] text-ink-soft leading-snug before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-sand-400">
            {{ tip }}
          </li>
        </ul>
      </div>

      <div v-if="suggestions.length" class="mt-4">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sand-600 mb-2">
          Popular experiences
        </p>
        <div class="flex flex-wrap gap-2">
          <span v-for="exp in suggestions.slice(0, 6)" :key="exp" class="chip !bg-ivory">
            {{ exp }}
          </span>
        </div>
      </div>

      <p v-if="selectedDest.imageCredit && !imageFailed" class="mt-4 text-[11px] text-ink-mute">
        Photo:
        <a
          :href="selectedDest.imageCredit.source"
          target="_blank"
          rel="noopener noreferrer"
          class="underline decoration-stone-300 hover:text-ink"
        >{{ selectedDest.imageCredit.author }}</a>
        · {{ selectedDest.imageCredit.license }} · Wikimedia Commons
      </p>
    </div>

    <!-- Custom destination -->
    <div class="pt-1">
      <label class="text-[13px] font-semibold text-ink-soft mb-2 block">
        Or type another place
      </label>
      <input
        v-model="customDestination"
        type="text"
        placeholder="e.g. Kulen Mountain, Bokor, island hop…"
        class="field !h-12"
        @input="handleCustomInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { POPULAR_DESTINATIONS, findDestination, FEES_CHECKED } from '../data/destinations'
import { isInSeason, monthName } from '../utils/season'
import { getSuggestionsForDestination } from '../data/activities'
import Emoji3D from './Emoji3D.vue'
import PhotoChoiceCard from './PhotoChoiceCard.vue'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  modelValue: string
  /** Month (1–12) the trip starts, or the current month when no dates are set. */
  travelMonth?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const popularDestinations = POPULAR_DESTINATIONS
const customDestination = ref('')

const selectedDest = computed(() => findDestination(props.modelValue))

// "Good time to go?" based on the destination's best season.
const seasonCheck = computed(() => {
  const dest = selectedDest.value
  if (!dest?.bestSeason || !props.travelMonth) return null
  const good = isInSeason(dest.bestSeason, props.travelMonth)
  if (good === null) return null
  const month = monthName(props.travelMonth)
  return good
    ? { good, text: `${month} is a great time to visit` }
    : { good, text: `${month} is outside the best season (${dest.bestSeason})` }
})

const suggestions = computed(() => getSuggestionsForDestination(props.modelValue))

// Remote (Wikimedia) photos can fail or be rate-limited; fall back to the emoji tile.
const imageFailed = ref(false)
watch(() => selectedDest.value?.image, () => { imageFailed.value = false })

const selectDestination = (name: string) => {
  emit('update:modelValue', name)
  customDestination.value = ''
}

const handleCustomInput = () => {
  emit('update:modelValue', customDestination.value)
}

watch(
  () => props.modelValue,
  (value) => {
    if (!selectedDest.value) {
      customDestination.value = value
    }
  }
)
</script>