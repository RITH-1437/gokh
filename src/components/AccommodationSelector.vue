<template>
  <div class="space-y-5">
    <div class="grid grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-4">
      <PhotoChoiceCard
        v-for="option in options"
        :key="option.value"
        compact
        class="h-[190px] sm:h-[240px] md:h-[280px]"
        :title="option.label"
        :image="option.image"
        :emoji="option.emoji"
        :subtitle="option.subtitle"
        :selected="modelValue.type === option.value"
        @select="selectAccommodation(option.value)"
      />
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
import PhotoChoiceCard from './PhotoChoiceCard.vue'

import hotelImg from '../assets/images/sleep/hotel.webp'
import guesthouseImg from '../assets/images/sleep/guest-house.webp'
import campingImg from '../assets/images/sleep/camping.webp'

const props = defineProps<{
  modelValue: Accommodation
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Accommodation]
}>()

const options = [
  { value: 'hotel' as AccommodationType, label: 'Hotel', emoji: '🏨', image: hotelImg, subtitle: 'Pools, AC and breakfast' },
  { value: 'guesthouse' as AccommodationType, label: 'Guesthouse', emoji: '🏠', image: guesthouseImg, subtitle: 'Local, friendly, affordable' },
  { value: 'camping' as AccommodationType, label: 'Camping', emoji: '⛺', image: campingImg, subtitle: 'Sleep under the stars' }
]

const name = ref(props.modelValue.name || '')

const selectAccommodation = (type: AccommodationType) => {
  emit('update:modelValue', { type, name: name.value })
}

watch(name, (value) => {
  emit('update:modelValue', { type: props.modelValue.type, name: value })
})
</script>