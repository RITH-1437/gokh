<template>
  <div class="space-y-5">
    <div class="flex gap-3">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        @click="selectTransportation(option.value)"
        :class="[
          'group flex-1 rounded-2xl border-2 p-4 sm:p-5 flex flex-col items-center gap-2.5 transition-all duration-200 focus-ring active:scale-[.98]',
          modelValue.type === option.value
            ? 'border-cambodia-500 bg-cambodia-50/70 shadow-glow'
            : 'border-stone-200/80 bg-white hover:border-cambodia-300 hover:-translate-y-0.5 hover:shadow-soft'
        ]"
      >
        <div class="relative">
          <Emoji3D
            :emoji="option.emoji"
            size="xl"
            shape="tile"
            :tone="modelValue.type === option.value ? 'green' : 'ivory'"
            :float="modelValue.type === option.value"
            :float-delay="700"
          />
          <span
            v-if="modelValue.type === option.value"
            class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-cambodia-600 text-white flex items-center justify-center shadow-glow animate-check-pop"
          >
            <Icon name="check" :size="13" />
          </span>
        </div>
        <span class="font-bold text-ink text-[15px]">{{ option.label }}</span>
        <span
          v-if="modelValue.type === option.value"
          class="text-[12px] font-semibold text-cambodia-700 animate-pop-in"
        >
          Selected
        </span>
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
import Emoji3D from './Emoji3D.vue'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  modelValue: Transportation
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Transportation]
}>()

const options = [
  { value: 'motorcycle' as TransportationType, label: 'Motorcycle', emoji: '🛵' },
  { value: 'van' as TransportationType, label: 'Van', emoji: '🚐' }
]

const note = ref(props.modelValue.note || '')

const selectTransportation = (type: TransportationType) => {
  emit('update:modelValue', { type, note: note.value })
}

watch(note, (value) => {
  emit('update:modelValue', { type: props.modelValue.type, note: value })
})
</script>