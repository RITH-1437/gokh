<template>
  <div
    :class="[
      'emoji3d relative inline-flex items-center justify-center flex-none',
      shapeClasses,
      sizeClasses,
      toneClasses,
      floatClass,
      props.class
    ]"
    :style="floatDelay ? { animationDelay: `${floatDelay}ms` } : undefined"
    role="img"
    :aria-label="ariaLabel || undefined"
  >
    <span :class="['leading-none select-none', emojiSizeClass]">{{ emoji }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  emoji: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'disc' | 'tile'
  tone?: 'ivory' | 'green' | 'sand'
  float?: boolean
  floatDelay?: number
  class?: string
  ariaLabel?: string
}>(), {
  size: 'md',
  shape: 'disc',
  tone: 'ivory',
  float: false,
  floatDelay: 0
})

const shapeClasses = computed(() =>
  props.shape === 'tile' ? 'rounded-2xl' : 'rounded-full'
)

const sizeClasses = computed(() => ({
  xs: 'w-9 h-9',
  sm: 'w-11 h-11',
  md: 'w-14 h-14',
  lg: 'w-[72px] h-[72px]',
  xl: 'w-24 h-24'
}[props.size]))

const emojiSizeClass = computed(() => ({
  xs: 'text-[18px]',
  sm: 'text-[22px]',
  md: 'text-[28px]',
  lg: 'text-[34px]',
  xl: 'text-[44px]'
}[props.size]))

const toneClasses = computed(() => ({
  ivory: 'tone-ivory',
  green: 'tone-green',
  sand: 'tone-sand'
}[props.tone]))

const floatClass = computed(() => {
  if (!props.float) return ''
  return props.size === 'sm' || props.size === 'xs'
    ? 'animate-float'
    : 'animate-float-slow'
})
</script>

<style scoped>
.emoji3d {
  border: 1px solid rgba(42, 38, 32, 0.05);
  box-shadow: var(--tw-shadow, 0 12px 24px -10px rgba(74, 58, 26, 0.38));
  transform: translateZ(0);
}
.tone-ivory {
  background: linear-gradient(160deg, #ffffff 0%, #f7f1e4 62%, #eee4d1 100%);
}
.tone-green {
  background: linear-gradient(160deg, #f4faf5 0%, #e2efe6 58%, #cfe3d6 100%);
}
.tone-sand {
  background: linear-gradient(160deg, #fff9ee 0%, #f6ead2 58%, #ecdab3 100%);
}
</style>