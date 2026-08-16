<template>
  <span class="inline-flex items-center gap-2" :class="props.class">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      class="flex-none"
    >
      <defs>
        <linearGradient id="gokh-brand-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#3D855F" />
          <stop offset="1" stop-color="#24553D" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#gokh-brand-g)" />
      <path
        d="M10 50c8-14 26-14 34-26"
        stroke="#FBF6EC"
        stroke-opacity=".35"
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="1 7"
      />
      <path
        d="M32 12c-7.6 0-13.8 6.2-13.8 13.8 0 10.3 13.8 24.4 13.8 24.4s13.8-14.1 13.8-24.4C45.8 18.2 39.6 12 32 12z"
        stroke="#FBF6EC"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="32" cy="25.5" r="5.4" fill="#F6EAD2" />
      <path d="M36 32.5l6.5 6.5" stroke="#F6EAD2" stroke-width="4" stroke-linecap="round" />
    </svg>
    <span
      v-if="showText"
      class="font-extrabold tracking-tight text-ink"
      :class="textSizeClass"
    >GoKH</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: number
  showText?: boolean
  textSize?: 'sm' | 'md'
  class?: string
}>(), {
  size: 28,
  showText: true,
  textSize: 'md'
})

const textSizeClass = computed(() => (props.textSize === 'sm' ? 'text-lg' : 'text-xl'))
</script>