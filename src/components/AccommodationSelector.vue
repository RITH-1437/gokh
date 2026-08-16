<template>
  <div class="space-y-5">
    <div class="grid grid-cols-3 gap-3.5">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        @click="selectAccommodation(option.value)"
        :class="[
          'group relative overflow-hidden rounded-3xl border-2 bg-white text-left transition-all duration-300 will-change-transform focus-ring active:scale-[.97]',
          modelValue.type === option.value
            ? 'border-cambodia-500 shadow-glow ring-4 ring-cambodia-500/15'
            : 'border-stone-200/80 hover:border-cambodia-300 hover:-translate-y-1 hover:shadow-lift'
        ]"
      >
        <div class="relative h-20 sm:h-24 w-full overflow-hidden">
          <img
            :src="option.image"
            :alt="option.label"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <span class="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[14px] shadow-soft">
            {{ option.emoji }}
          </span>

          <span
            v-if="modelValue.type === option.value"
            class="absolute top-2 right-2 w-7 h-7 rounded-full bg-cambodia-600 text-white flex items-center justify-center shadow-glow animate-check-pop"
          >
            <Icon name="check" :size="14" />
          </span>

          <div class="absolute inset-x-0 bottom-0 p-2.5">
            <div class="font-bold text-white text-[13px] leading-tight drop-shadow-sm">{{ option.label }}</div>
          </div>
        </div>

        <div
          :class="[
            'h-8 flex items-center justify-center text-[11px] font-bold tracking-wide transition-colors duration-200',
            modelValue.type === option.value ? 'bg-cambodia-600 text-white' : 'bg-ivory text-ink-mute group-hover:text-cambodia-700'
          ]"
        >
          <Icon v-if="modelValue.type === option.value" name="check" :size="12" class="mr-1" />
          {{ modelValue.type === option.value ? 'Selected' : 'Choose' }}
        </div>
      </button>
    </div>

    <div>
      <label class="text-[13px] font-semibold text-ink-soft mb-2 block">
        Place <span class="font-normal text-ink-mute">(optional)</span>
      </label>
      <input
        v-model="name"
        type="text"
        placeholder="e.g. Angkor Paradise Guesthouse"
        class="field !h-12"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Accommodation, AccommodationType } from '../types/trip'
import Icon from './icons/Icon.vue'

import hotelImg from '../assets/images/sleep/hotel.png'
import guesthouseImg from '../assets/images/sleep/guest-house.png'
import campingImg from '../assets/images/sleep/camping.png'

const props = defineProps<{
  modelValue: Accommodation
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Accommodation]
}>()

const options = [
  { value: 'hotel' as AccommodationType, label: 'Hotel', emoji: '🏨', image: hotelImg },
  { value: 'guesthouse' as AccommodationType, label: 'Guesthouse', emoji: '🏠', image: guesthouseImg },
  { value: 'camping' as AccommodationType, label: 'Camping', emoji: '⛺', image: campingImg }
]

const name = ref(props.modelValue.name || '')

const selectAccommodation = (type: AccommodationType) => {
  emit('update:modelValue', { type, name: name.value })
}

watch(name, (value) => {
  emit('update:modelValue', { type: props.modelValue.type, name: value })
})
</script>