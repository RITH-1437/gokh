<template>
  <!-- Desktop: horizontal step track (scrolls gracefully on narrow widths) -->
  <div class="hidden md:flex items-center overflow-x-auto no-scrollbar">
    <template v-for="(step, index) in steps" :key="step.key">
      <button
        type="button"
        :disabled="!step.done"
        class="flex flex-none items-center gap-2.5 whitespace-nowrap focus-ring rounded-xl disabled:cursor-default"
        :aria-label="step.done ? `Go back to ${step.label} — done` : `${step.label} — ${isCurrent(step) ? 'current step' : 'upcoming'}`"
        @click="emit('navigate', step.key)"
      >
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300',
            step.done
              ? 'bg-cambodia-600 text-white shadow-glow'
              : isCurrent(step)
                ? 'bg-white border-2 border-cambodia-500 text-cambodia-700 shadow-glow'
                : 'bg-white border border-stone-200 text-ink-mute'
          ]"
        >
          <Icon v-if="step.done" name="check" :size="14" class="animate-check-pop" />
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span
          :class="[
            'text-[13px] font-semibold transition-colors duration-200',
            step.done
              ? 'text-cambodia-700'
              : isCurrent(step)
                ? 'text-ink'
                : 'text-ink-mute'
          ]"
        >{{ step.label }}</span>
        <span
          v-if="isCurrent(step)"
          class="text-[10px] font-bold uppercase tracking-[0.14em] text-cambodia-600 bg-cambodia-50 border border-cambodia-200/70 rounded-full px-2 py-0.5"
        >Now</span>
      </button>

      <div
        v-if="index < steps.length - 1"
        class="flex-none h-[3px] rounded-full mx-3 w-6 md:w-8 bg-stone-200 overflow-hidden"
      >
        <div
          class="h-full bg-gradient-to-r from-cambodia-500 to-cambodia-600 rounded-full transition-all duration-500"
          :style="{ width: step.done ? '100%' : '0%' }"
        />
      </div>
    </template>
  </div>

  <!-- Mobile: compact progress bar -->
  <div class="md:hidden">
    <div class="flex items-center justify-between text-[13px] font-semibold text-ink-soft mb-1.5">
      <span>
        {{ doneCount }} of {{ steps.length }} planned
      </span>
      <span class="text-cambodia-700 tnum">{{ percent }}%</span>
    </div>
    <div class="h-2 bg-stone-200 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full bg-gradient-to-r from-cambodia-500 to-cambodia-600 transition-all duration-500"
        :style="{ width: `${percent}%` }"
      />
    </div>
    <div v-if="currentLabel" class="mt-1.5 text-[12px] text-ink-mute">
      Now planning:
      <span class="font-bold text-cambodia-700">{{ currentLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from './icons/Icon.vue'

interface ProgressStep {
  key: string
  label: string
  done: boolean
}

const props = withDefaults(defineProps<{
  steps: ProgressStep[]
  currentKey?: string
}>(), {
  currentKey: ''
})

const emit = defineEmits<{
  navigate: [key: string]
}>()

const isCurrent = (step: ProgressStep) =>
  props.currentKey === step.key && !step.done

const currentLabel = computed(() =>
  props.steps.find(s => isCurrent(s))?.label || ''
)

const doneCount = computed(() => props.steps.filter(s => s.done).length)
const percent = computed(() =>
  props.steps.length ? Math.round((doneCount.value / props.steps.length) * 100) : 0
)
</script>
