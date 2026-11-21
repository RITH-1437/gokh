<template>
  <button
    type="button"
    :aria-pressed="selected"
    :class="[
      'group relative overflow-hidden text-left transition-all duration-300 will-change-transform focus-ring active:scale-[.97]',
      compact ? 'rounded-2xl sm:rounded-[22px]' : 'rounded-[26px]',
      selected
        ? 'ring-[3px] ring-cambodia-500 ring-offset-[3px] ring-offset-ivory shadow-glow'
        : 'shadow-soft hover:-translate-y-1.5 hover:shadow-lift'
    ]"
    @click="emit('select')"
  >
    <img
      v-if="image && !imageFailed"
      :src="image"
      :alt="title"
      loading="lazy"
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
      @error="imageFailed = true"
    />
    <div v-else class="absolute inset-0 bg-gradient-to-br from-cambodia-600 to-cambodia-900 flex items-center justify-center">
      <Emoji3D :emoji="emoji || '📍'" size="lg" shape="tile" tone="green" />
    </div>
    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/0" />

    <span
      v-if="badge"
      :class="[
        'absolute top-2.5 left-2.5 sm:top-3 sm:left-3 glass rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white',
        compact ? 'hidden sm:inline-flex' : 'inline-flex'
      ]"
    >{{ badge }}</span>

    <span
      v-if="selected"
      class="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cambodia-500 text-white flex items-center justify-center shadow-glow animate-check-pop"
    >
      <Icon name="check" :size="15" />
    </span>

    <div :class="['absolute inset-x-0 bottom-0', compact ? 'p-2 sm:p-4' : 'p-4']">
      <div :class="['font-extrabold text-white leading-tight drop-shadow', compact ? 'text-[12.5px] min-[400px]:text-[13.5px] sm:text-lg [overflow-wrap:anywhere]' : 'text-xl truncate']">
        {{ title }}
      </div>
      <div v-if="subtitle" :class="['text-white/80 leading-snug mt-0.5', compact ? 'hidden sm:block text-[12.5px]' : 'text-[13px]']">
        {{ subtitle }}
      </div>
      <div :class="['flex items-center justify-between gap-2', compact ? 'mt-2 sm:mt-3' : 'mt-3']">
        <span v-if="meta" class="hidden sm:inline text-[11.5px] font-semibold text-white/70">{{ meta }}</span>
        <span
          :class="[
            'ml-auto inline-flex items-center gap-1 rounded-full font-bold transition-all duration-300',
            compact ? 'px-2.5 py-1 text-[11px] sm:text-[12px]' : 'px-3 py-1 text-[12px]',
            selected ? 'bg-cambodia-500 text-white' : 'bg-white text-ink opacity-90 group-hover:opacity-100 group-hover:bg-sand-300'
          ]"
        >
          {{ selected ? 'Selected' : 'Choose' }}
        </span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Emoji3D from './Emoji3D.vue'
import Icon from './icons/Icon.vue'

// Photo-led selectable card shared by the destination, transport and stay steps.
const props = defineProps<{
  title: string
  image?: string
  subtitle?: string
  badge?: string
  emoji?: string
  meta?: string
  selected?: boolean
  /** Smaller text/padding for 3-across grids on phones. */
  compact?: boolean
}>()

const emit = defineEmits<{
  select: []
}>()

// Remote photos can fail; fall back to the emoji tile.
const imageFailed = ref(false)
watch(() => props.image, () => { imageFailed.value = false })
</script>
