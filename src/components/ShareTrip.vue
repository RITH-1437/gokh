<template>
  <div class="relative surface !rounded-3xl p-6 sm:p-7 overflow-hidden text-center">
    <div class="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-20" style="background: radial-gradient(closest-side, #E2BD76, transparent)" />

    <div class="relative flex flex-col items-center">
      <Emoji3D emoji="🔗" size="lg" float :float-delay="400" />

      <h3 class="mt-4 text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
        Ready to share?
      </h3>
      <p class="mt-1.5 text-[14px] text-ink-mute leading-relaxed max-w-xs">
        Your adventure is ready. Send it to your crew with one link.
      </p>

      <button
        class="btn-gold w-full sm:w-auto sm:min-w-[260px] mt-5 !h-12"
        :disabled="isSharing || !canShare"
        @click="handleShare"
      >
        <Icon v-if="isSharing" name="loader" :size="18" class="animate-spin" />
        <Icon v-else-if="isCopied" name="check" :size="18" />
        <Icon v-else name="link" :size="18" />
        <span>{{ buttonText }}</span>
      </button>

      <div v-if="isCopied" class="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-cambodia-700 animate-pop-in">
        <Icon name="check-circle" :size="15" />
        Trip link copied — send it to your friends
      </div>

      <!-- Share link (manual copy) -->
      <div v-if="shareUrl && !isCopied" class="mt-4 w-full max-w-sm">
        <div class="flex gap-2">
          <input
            :value="shareUrl"
            readonly
            class="flex-1 min-w-0 h-11 px-3 rounded-xl bg-ivory border border-stone-200 text-[12px] text-ink-soft truncate focus:outline-none focus:border-cambodia-400"
          />
          <button class="btn-ghost !h-11 !px-4 text-sm shrink-0" @click="copyUrl">
            Copy
          </button>
        </div>
      </div>

      <details class="mt-4 w-full max-w-sm text-left group">
        <summary class="cursor-pointer list-none text-[12px] text-ink-mute hover:text-ink transition-colors inline-flex items-center gap-1">
          <Icon name="info" :size="13" />
          How does sharing work?
        </summary>
        <p class="mt-2 text-[12.5px] text-ink-mute leading-relaxed bg-ivory rounded-xl px-3.5 py-3">
          Your whole trip lives inside the link — no account or server needed. Anyone with it can view the trip and keep planning together.
        </p>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Trip } from '../types/trip'
import { useTripShare } from '../composables/useTripShare'
import { useToasts } from '../composables/useToasts'
import Emoji3D from './Emoji3D.vue'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  trip: Trip
}>()

const { shareUrl, isCopied, isSharing, error: shareError, shareTrip, copyToClipboard } = useTripShare()
const { success, warning, error } = useToasts()

const canShare = computed(
  () => props.trip.tripName.trim() !== '' || props.trip.destination.trim() !== ''
)

const buttonText = computed(() => {
  if (isSharing.value) return 'Creating link…'
  if (!canShare.value) return 'Add a destination first'
  return 'Share trip'
})

const handleShare = async () => {
  if (!canShare.value) {
    warning('Almost there', 'Give your trip a name or pick a destination to share it.')
    return
  }

  const ok = await shareTrip(props.trip)
  if (ok) {
    success('Trip link copied', 'Send it to your friends — they can open and keep planning.')
  } else if (shareError.value) {
    error('Something went wrong', shareError.value)
  }
}

const copyUrl = async () => {
  const ok = await copyToClipboard(shareUrl.value)
  if (ok) {
    success('Trip link copied', 'Send it to your friends.')
  }
}
</script>