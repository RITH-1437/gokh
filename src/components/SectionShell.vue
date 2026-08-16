<template>
  <section :id="id" class="relative flex gap-4 sm:gap-7 scroll-mt-24">
    <!-- Step rail -->
    <div class="flex flex-col items-center flex-none">
      <div
        :class="[
          'w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-[13px] sm:text-sm transition-all duration-300',
          done
            ? 'bg-cambodia-600 text-white shadow-glow'
            : 'bg-white border border-stone-200 text-ink-mute shadow-soft'
        ]"
        :aria-label="done ? `${title} complete` : `Step ${step}: ${title}`"
      >
        <Icon v-if="done" name="check" :size="17" class="animate-check-pop" />
        <span v-else>{{ step }}</span>
      </div>
      <div v-if="!last" class="w-px flex-1 bg-stone-200/80 mt-3 min-h-[24px]" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0 pb-10 sm:pb-12">
      <header class="mb-4 sm:mb-6">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-[11px] font-bold tracking-[0.2em] uppercase text-sand-600">
            Step {{ String(step).padStart(2, '0') }}
          </span>
          <span
            v-if="done"
            class="inline-flex items-center gap-1 text-[12px] font-semibold text-cambodia-700 bg-cambodia-50 border border-cambodia-200/70 rounded-full px-2 py-0.5 animate-pop-in"
          >
            <Icon name="check" :size="12" /> done
          </span>
        </div>
        <h2 class="text-2xl sm:text-[28px] font-extrabold tracking-tight text-ink leading-tight">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="mt-1 text-[15px] leading-relaxed text-ink-mute">
          {{ subtitle }}
        </p>
      </header>

      <div>
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Icon from './icons/Icon.vue'

defineProps<{
  step: number
  title: string
  subtitle?: string
  done?: boolean
  id?: string
  last?: boolean
}>()
</script>