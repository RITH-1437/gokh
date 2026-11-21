<template>
  <section :id="id" class="relative flex gap-4 sm:gap-7 scroll-mt-44">
    <!-- Step rail -->
    <div class="flex flex-col items-center flex-none">
      <div
        :class="[
          'w-9 h-9 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-extrabold text-[13px] sm:text-[15px] transition-all duration-300',
          done
            ? 'bg-gradient-to-br from-cambodia-500 to-cambodia-700 text-white shadow-glow'
            : 'bg-white border border-stone-200 text-ink shadow-soft'
        ]"
        :aria-label="done ? `${title} complete` : `Step ${step}: ${title}`"
      >
        <Icon v-if="done" name="check" :size="17" class="animate-check-pop" />
        <span v-else>{{ step }}</span>
      </div>
      <div
        v-if="!last"
        :class="['w-[2px] flex-1 mt-3 min-h-[24px] rounded-full transition-colors duration-500', done ? 'bg-gradient-to-b from-cambodia-400 to-stone-200' : 'bg-stone-200/80']"
      />
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
            class="text-[11px] font-bold uppercase tracking-wider text-cambodia-700 bg-cambodia-50 border border-cambodia-200/70 rounded-full px-2 py-0.5 animate-pop-in"
          >Done</span>
        </div>
        <h2 class="text-[26px] sm:text-[34px] font-extrabold tracking-tight text-ink leading-[1.1]">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="mt-1.5 text-[15px] sm:text-base leading-relaxed text-ink-mute">
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