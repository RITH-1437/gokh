<template>
  <span class="inline-flex items-center gap-2" :class="props.class">
    <img
      :src="logo"
      alt="GoKH"
      :style="{ height: `${size}px` }"
      class="w-auto object-contain flex-none"
      draggable="false"
    />
    <span
      v-if="showText"
      class="font-extrabold tracking-tight text-ink"
      :class="textSizeClass"
    >GoKH</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import logo from '../assets/images/logo.webp'

const props = withDefaults(defineProps<{
  size?: number
  showText?: boolean
  textSize?: 'sm' | 'md'
  class?: string
}>(), {
  size: 30,
  showText: true,
  textSize: 'md'
})

const textSizeClass = computed(() => (props.textSize === 'sm' ? 'text-lg' : 'text-xl'))
</script>