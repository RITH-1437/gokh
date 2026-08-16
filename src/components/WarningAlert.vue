<template>
  <div
    v-if="show"
    :class="[
      'rounded-2xl border p-4 transition-all duration-200 animate-fade-in',
      variantClasses
    ]"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0 mt-0.5">
        <Icon :name="iconName" :size="18" class="opacity-80" />
      </div>
      <div class="flex-1 min-w-0">
        <p v-if="!title" class="text-sm leading-relaxed">{{ message }}</p>
        <template v-else>
          <p class="text-sm font-semibold mb-0.5">{{ title }}</p>
          <p class="text-sm opacity-90 leading-relaxed">{{ message }}</p>
        </template>

        <div v-if="$slots.actions" class="mt-3">
          <slot name="actions"></slot>
        </div>
      </div>

      <button
        v-if="dismissible"
        @click="dismiss"
        class="flex-shrink-0 p-1 rounded-full opacity-40 hover:opacity-90 transition-opacity"
        aria-label="Dismiss"
      >
        <Icon name="x" :size="14" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from './icons/Icon.vue'

const props = withDefaults(defineProps<{
  variant?: 'info' | 'warning' | 'error' | 'success'
  title?: string
  message: string
  dismissible?: boolean
  autoClose?: number
}>(), {
  variant: 'info',
  dismissible: false,
  autoClose: 0
})

const emit = defineEmits<{
  dismiss: []
}>()

const show = ref(true)

const iconName = computed(() => {
  const map = { info: 'info', warning: 'alert-triangle', error: 'alert-circle', success: 'check-circle' }
  return map[props.variant]
})

const variantClasses = computed(() => {
  const map = {
    info: 'bg-sand-50 border-sand-200/70 text-ink-soft',
    warning: 'bg-sand-100/70 border-sand-300/60 text-ink',
    error: 'bg-clay-100/70 border-clay-500/25 text-clay-600',
    success: 'bg-cambodia-50 border-cambodia-200/70 text-cambodia-800'
  }
  return map[props.variant]
})

const dismiss = () => {
  show.value = false
  emit('dismiss')
}

if (props.autoClose > 0) {
  setTimeout(dismiss, props.autoClose)
}
</script>