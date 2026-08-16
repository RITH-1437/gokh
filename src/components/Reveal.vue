<template>
  <div ref="el" class="reveal" :class="{ 'is-revealed': shown }" :style="delayStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  delay?: number
  threshold?: number
}>(), {
  delay: 0,
  threshold: 0.1
})

const el = ref<HTMLElement>()
const shown = ref(false)
let observer: IntersectionObserver | null = null

const delayStyle = computed(() =>
  props.delay ? { transitionDelay: `${props.delay}ms` } : undefined
)

onMounted(() => {
  const node = el.value
  if (!node) return

  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced || typeof IntersectionObserver === 'undefined') {
    shown.value = true
    return
  }

  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          shown.value = true
          observer?.disconnect()
        }
      })
    },
    { threshold: props.threshold, rootMargin: '0px 0px -48px 0px' }
  )
  observer.observe(node)
})

onUnmounted(() => observer?.disconnect())
</script>