<template>
  <header
    :class="[
      'sticky top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-ivory/85 backdrop-blur-md shadow-soft border-b border-stone-200/70'
        : 'bg-transparent border-b border-transparent'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <button
          class="flex items-center gap-2.5 focus-ring rounded-xl"
          title="Back to top"
          @click="scrollToTop"
        >
          <BrandMark :size="30" show-text />
        </button>

        <span class="hidden md:inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-mute">
          <span class="text-[15px]">🇰🇭</span>
          Explore Cambodia together
        </span>

        <button
          class="btn-primary !h-10 !px-4 sm:!px-5 text-sm shrink-0"
          :disabled="isSharing"
          @click="emit('share')"
        >
          <Icon v-if="isSharing" name="loader" :size="16" class="animate-spin" />
          <Icon v-else name="link" :size="16" />
          <span>Share</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BrandMark from './BrandMark.vue'
import Icon from './icons/Icon.vue'

withDefaults(defineProps<{
  isSharing?: boolean
}>(), {
  isSharing: false
})

const emit = defineEmits<{
  share: []
}>()

const scrolled = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 8
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>