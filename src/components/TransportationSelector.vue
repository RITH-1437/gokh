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
        @select="selectTransportation(option.value)"
      />
    </div>

    <div>
      <label class="text-[13px] font-semibold text-ink-soft mb-2 block">
        Note <span class="font-normal text-ink-mute">(optional)</span>
      </label>
      <input
        v-model="note"
        type="text"
        placeholder="e.g. 2 motorcycles, private van"
        class="field !h-12"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Transportation, TransportationType } from '../types/trip'
import PhotoChoiceCard from './PhotoChoiceCard.vue'

import motorImg from '../assets/images/vehicle/motor-honda.webp'
import vanImg from '../assets/images/vehicle/van.webp'
import busImg from '../assets/images/vehicle/bus.webp'

const props = defineProps<{
  modelValue: Transportation
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Transportation]
}>()

const options = [
  { value: 'motorcycle' as TransportationType, label: 'Motorcycle', emoji: '🛵', image: motorImg, subtitle: 'Freedom for small crews' },
  { value: 'van' as TransportationType, label: 'Van', emoji: '🚐', image: vanImg, subtitle: 'Comfort door to door' },
  { value: 'bus' as TransportationType, label: 'Bus', emoji: '🚌', image: busImg, subtitle: 'Easy and budget-friendly' }
]

const note = ref(props.modelValue.note || '')

const selectTransportation = (type: TransportationType) => {
  emit('update:modelValue', { type, note: note.value })
}

watch(note, (value) => {
  emit('update:modelValue', { type: props.modelValue.type, note: value })
})
</script>