<template>
  <!-- Desktop: horizontal step track -->
  <div class="hidden md:flex items-center">
    <template v-for="(step, index) in steps" :key="step.key">
      <div class="flex items-center gap-2.5">
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300',
            step.done
              ? 'bg-cambodia-600 text-white shadow-glow'
              : 'bg-white border border-stone-200 text-ink-mute'
          ]"
        >
          <Icon v-if="step.done" name="check" :size="14" class="animate-check-pop" />
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span
          :class="[
            'text-[13px] font-semibold transition-colors duration-200',
            step.done ? 'text-cambodia-700' : 'text-ink-mute'
          ]"
        >{{ step.label }}</span>
      </div>

      <div
        v-if="index < steps.length - 1"
        class="flex-1 h-[3px] rounded-full mx-3 bg-stone-200 overflow-hidden"
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

const props = defineProps<{
  steps: ProgressStep[]
}>()

const doneCount = computed(() => props.steps.filter(s => s.done).length)
const percent = computed(() =>
  props.steps.length ? Math.round((doneCount.value / props.steps.length) * 100) : 0
)
</script>