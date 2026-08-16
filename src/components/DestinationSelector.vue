<template>
  <div class="space-y-5">
    <!-- Popular destinations -->
    <div>
      <p class="text-[13px] font-semibold text-ink-soft mb-2.5">Popular in Cambodia</p>

      <!-- Mobile: horizontal snap scroll · Desktop: grid -->
      <div class="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:gap-3">
        <button
          v-for="dest in popularDestinations"
          :key="dest.name"
          type="button"
          @click="selectDestination(dest.name)"
          :class="[
            'group relative snap-start shrink-0 w-[200px] lg:w-auto overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-200 focus-ring active:scale-[.98]',
            modelValue === dest.name
              ? 'border-cambodia-500 shadow-glow'
              : 'border-stone-200/80 hover:border-cambodia-300 hover:-translate-y-0.5 hover:shadow-soft'
          ]"
        >
          <!-- Photo cover -->
          <div class="relative h-24 sm:h-28 w-full">
            <img
              v-if="dest.image"
              :src="dest.image"
              :alt="dest.name"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            />
            <div v-else class="h-full w-full bg-cambodia-50 flex items-center justify-center">
              <Emoji3D
                :emoji="dest.emoji || '📍'"
                size="lg"
                shape="tile"
                :tone="modelValue === dest.name ? 'green' : 'ivory'"
              />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

            <span class="absolute top-2 left-2 inline-flex items-center rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
              {{ dest.region }}
            </span>

            <span
              v-if="modelValue === dest.name"
              class="absolute top-2 right-2 w-6 h-6 rounded-full bg-cambodia-600 text-white flex items-center justify-center shadow-glow animate-check-pop"
            >
              <Icon name="check" :size="13" />
            </span>
          </div>

          <!-- Card body -->
          <div class="px-3.5 py-3">
            <div class="font-bold text-[15px] text-ink leading-tight">{{ dest.name }}</div>
            <div class="text-[12.5px] text-ink-mute leading-snug mt-0.5">
              {{ dest.tagline || dest.region }}
            </div>
          </div>

          <div
            v-if="modelValue === dest.name"
            class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cambodia-500 to-cambodia-600"
          />
        </button>
      </div>
    </div>

    <!-- Contextual destination panel -->
    <div v-if="selectedDest" class="animate-slide-down surface !rounded-2xl p-5">
      <div class="flex items-center gap-3.5">
        <img
          v-if="selectedDest.image"
          :src="selectedDest.image"
          :alt="selectedDest.name"
          loading="lazy"
          class="w-14 h-14 rounded-2xl object-cover shadow-soft border border-white"
        />
        <Emoji3D v-else :emoji="selectedDest.emoji || '📍'" size="sm" shape="tile" tone="green" />
        <div>
          <div class="font-extrabold text-ink text-lg leading-tight">{{ selectedDest.name }}</div>
          <div class="text-[13px] text-ink-mute">{{ selectedDest.tagline }}</div>
        </div>
      </div>

      <div v-if="suggestions.length" class="mt-4">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sand-600 mb-2">
          Popular experiences
        </p>
        <div class="flex flex-wrap gap-2">
          <span v-for="exp in suggestions.slice(0, 6)" :key="exp" class="chip !bg-ivory">
            <span class="text-[13px]">✦</span>{{ exp }}
          </span>
        </div>
      </div>
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
import { POPULAR_DESTINATIONS, findDestination } from '../data/destinations'
import { getSuggestionsForDestination } from '../data/activities'
import Emoji3D from './Emoji3D.vue'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const popularDestinations = POPULAR_DESTINATIONS
const customDestination = ref('')

const selectedDest = computed(() => findDestination(props.modelValue))

const suggestions = computed(() => getSuggestionsForDestination(props.modelValue))

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