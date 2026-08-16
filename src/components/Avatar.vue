<template>
  <div class="relative inline-flex flex-none">
    <div
      :class="[
        'rounded-full flex items-center justify-center font-bold select-none',
        sizeClasses,
        avatarPalette
      ]"
      :style="{ boxShadow: 'inset 0 2px 4px rgba(42,38,32,.06), 0 4px 10px -4px rgba(42,38,32,.25)' }"
      role="img"
      :aria-label="name"
    >
      {{ initials }}
    </div>
    <div
      v-if="role === 'leader'"
      class="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-emoji-sm"
      title="Trip Leader"
    >
      <span class="text-[10px] leading-none">👑</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  role?: 'leader' | 'member'
  tone?: number
}>(), {
  size: 'md',
  role: 'member',
  tone: 0
})

const PALETTES = [
  'bg-gradient-to-br from-cambodia-400 to-cambodia-700 text-white',
  'bg-gradient-to-br from-sand-300 to-sand-600 text-white',
  'bg-gradient-to-br from-clay-500 to-cambodia-800 text-white',
  'bg-gradient-to-br from-cambodia-200 to-cambodia-500 text-cambodia-900',
  'bg-gradient-to-br from-stone-300 to-stone-500 text-white'
]

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

const avatarPalette = computed(() => {
  let hash = props.tone
  for (let i = 0; i < props.name.length; i++) {
    hash = (hash * 31 + props.name.charCodeAt(i)) % 9973
  }
  return PALETTES[hash % PALETTES.length]
})

const sizeClasses = computed(() => ({
  xs: 'w-8 h-8 text-[12px]',
  sm: 'w-10 h-10 text-[13px]',
  md: 'w-12 h-12 text-[15px]',
  lg: 'w-16 h-16 text-xl'
}[props.size]))
</script>