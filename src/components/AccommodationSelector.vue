<template>
  <div class="space-y-5">
    <div class="grid grid-cols-3 gap-3">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        @click="selectAccommodation(option.value)"
        :class="[
          'group rounded-2xl border-2 p-3 sm:p-4 flex flex-col items-center gap-2.5 transition-all duration-200 focus-ring active:scale-[.98]',
          modelValue.type === option.value
            ? 'border-cambodia-500 bg-cambodia-50/70 shadow-glow'
            : 'border-stone-200/80 bg-white hover:border-cambodia-300 hover:-translate-y-0.5 hover:shadow-soft'
        ]"
      >
        <div class="relative">
          <Emoji3D
            :emoji="option.emoji"
            size="md"
            shape="tile"
            :tone="modelValue.type === option.value ? 'green' : 'ivory'"
            :float="modelValue.type === option.value"
            :float-delay="800"
          />
          <span
            v-if="modelValue.type === option.value"
            class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cambodia-600 text-white flex items-center justify-center shadow-glow animate-check-pop"
          >
            <Icon name="check" :size="11" />
          </span>
        </div>
        <span class="font-bold text-ink text-[13px] sm:text-sm">{{ option.label }}</span>
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
import Emoji3D from './Emoji3D.vue'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  modelValue: Accommodation
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Accommodation]
}>()

const options = [
  { value: 'hotel' as AccommodationType, label: 'Hotel', emoji: '🏨' },
  { value: 'guesthouse' as AccommodationType, label: 'Guesthouse', emoji: '🏠' },
  { value: 'camping' as AccommodationType, label: 'Camping', emoji: '⛺' }
]

const name = ref(props.modelValue.name || '')

const selectAccommodation = (type: AccommodationType) => {
  emit('update:modelValue', { type, name: name.value })
}

watch(name, (value) => {
  emit('update:modelValue', { type: props.modelValue.type, name: value })
})
</script>