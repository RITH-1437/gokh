import { ref, onUnmounted } from 'vue'

// Smoothly animates a numeric value toward a target using rAF.
// Keeps the UI feeling alive when budget / contributions / counts change.
export const useAnimatedNumber = (duration = 400) => {
  const value = ref(0)
  let rafId = 0
  let current = 0
  let target = 0
  let startTime = 0
  let from = 0

  const tick = (time: number) => {
    const progress = Math.min(1, (time - startTime) / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    current = from + (target - from) * eased
    value.value = current
    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    }
  }

  const set = (next: number) => {
    from = current
    target = next
    startTime = performance.now()
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(tick)
  }

  const stop = () => cancelAnimationFrame(rafId)

  onUnmounted(stop)

  return { value, set }
}