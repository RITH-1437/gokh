<template>
  <Teleport to="body">
    <div
      class="fixed z-[70] flex flex-col gap-2.5 max-w-[calc(100vw-32px)] w-full sm:w-auto sm:min-w-[320px] sm:max-w-sm bottom-4 sm:bottom-6 sm:right-6 px-4 sm:px-0 pointer-events-none"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 rounded-2xl bg-ink text-white/95 shadow-lift border border-white/10 px-4 py-3.5"
          role="status"
        >
          <span class="flex-none w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-sm">
            {{ toastIcon(toast.type) }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-snug">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-[13px] text-white/70 mt-0.5 leading-snug">
              {{ toast.message }}
            </p>
          </div>
          <button
            class="flex-none p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
            @click="remove(toast.id)"
            aria-label="Dismiss notification"
          >
            <Icon name="x" :size="13" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToasts } from '../composables/useToasts'
import Icon from './icons/Icon.vue'

const { toasts, remove } = useToasts()

const toastIcon = (type: string) => {
  const map: Record<string, string> = {
    success: '✓',
    info: 'i',
    warning: '!',
    error: '✕'
  }
  return map[type] || 'i'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}
</style>