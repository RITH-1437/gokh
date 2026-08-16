<template>
  <div class="space-y-5">
    <div class="grid grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-4">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        @click="selectTransportation(option.value)"
        :class="[
          'group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 bg-white text-left transition-all duration-300 will-change-transform focus-ring active:scale-[.97]',
          modelValue.type === option.value
            ? 'border-cambodia-500 shadow-glow ring-4 ring-cambodia-500/15'
            : 'border-stone-200/80 hover:border-cambodia-300 hover:-translate-y-1 hover:shadow-lift'
        ]"
      >
        <div class="relative h-36 sm:h-44 md:h-56 w-full overflow-hidden">
          <img
            :src="option.image"
            :alt="option.label"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <span class="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[13px] sm:text-[14px] shadow-soft">
            {{ option.emoji }}
          </span>

          <span
            v-if="modelValue.type === option.value"
            class="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cambodia-600 text-white flex items-center justify-center shadow-glow animate-check-pop"
          >
            <Icon name="check" :size="13" />
          </span>

          <div class="absolute inset-x-0 bottom-0 p-1.5 sm:p-2.5">
            <div class="font-bold text-white text-[12px] sm:text-[13px] md:text-sm leading-tight drop-shadow-sm truncate">{{ option.label }}</div>
          </div>
        </div>

        <div
          :class="[
            'h-11 sm:h-12 flex items-center justify-center text-[11.5px] sm:text-[12.5px] font-bold tracking-wide transition-colors duration-200',
            modelValue.type === option.value ? 'bg-cambodia-600 text-white' : 'bg-ivory text-ink-mute group-hover:text-cambodia-700'
          ]"
        >
          <Icon v-if="modelValue.type === option.value" name="check" :size="11" class="mr-1" />
          {{ modelValue.type === option.value ? 'Selected' : 'Choose' }}
        </div>
      </button>
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
import Icon from './icons/Icon.vue'

import motorImg from '../assets/images/vehicle/motor-honda.png'
import vanImg from '../assets/images/vehicle/van.png'
import busImg from '../assets/images/vehicle/bus.png'

const props = defineProps<{
  modelValue: Transportation
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Transportation]
}>()

const options = [
  { value: 'motorcycle' as TransportationType, label: 'Motorcycle', emoji: '🛵', image: motorImg },
  { value: 'van' as TransportationType, label: 'Van', emoji: '🚐', image: vanImg },
  { value: 'bus' as TransportationType, label: 'Bus', emoji: '🚌', image: busImg }
]

const note = ref(props.modelValue.note || '')

const selectTransportation = (type: TransportationType) => {
  emit('update:modelValue', { type, note: note.value })
}

watch(note, (value) => {
  emit('update:modelValue', { type: props.modelValue.type, note: value })
})
</script>