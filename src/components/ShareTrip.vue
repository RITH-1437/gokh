<template>
  <div class="relative rounded-[28px] p-6 sm:p-7 overflow-hidden text-center text-white bg-gradient-to-br from-cambodia-700 via-cambodia-800 to-cambodia-900 shadow-lift">
    <div class="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full opacity-30" style="background: radial-gradient(closest-side, #E2BD76, transparent)" />
    <div class="pointer-events-none absolute -bottom-24 -left-16 w-64 h-64 rounded-full opacity-20" style="background: radial-gradient(closest-side, #5FA07D, transparent)" />

    <div class="relative flex flex-col items-center">
      <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-sand-300">Share</span>

      <h3 class="mt-2 text-2xl sm:text-[28px] font-extrabold tracking-tight leading-tight">
        {{ heading }}
      </h3>
      <p class="mt-2 text-[14px] text-white/75 leading-relaxed max-w-xs">
        {{ description }}
      </p>

      <button
        class="btn-gold w-full sm:w-auto sm:min-w-[260px] mt-5 !h-12"
        :disabled="isSharing"
        @click="handlePrimary"
      >
        <Icon v-if="isSharing" name="loader" :size="18" class="animate-spin" />
        <span>{{ buttonText }}</span>
      </button>

      <div v-if="isReady && isCopied" class="mt-3 text-[13px] font-semibold text-sand-200 animate-pop-in" role="status">
        Trip link copied — send it to your friends
      </div>

      <p v-if="isReady && shareInfo" class="mt-2 text-[12px] text-white/70">
        Link ID <span class="font-mono font-semibold text-white">{{ shareInfo.id }}</span>
        — your crew sees the same ID when they open it.
      </p>

      <!-- Share link (manual copy) -->
      <div v-if="shareUrl && isReady && !isCopied" class="mt-4 w-full max-w-sm">
        <div class="flex gap-2">
          <input
            :value="shareUrl"
            readonly
            aria-label="Share link"
            class="flex-1 min-w-0 h-11 px-3 rounded-xl bg-white/10 border border-white/20 text-[12px] text-white/90 truncate focus:outline-none focus:border-sand-300"
          />
          <button class="glass h-11 px-4 rounded-xl text-sm font-semibold text-white hover:bg-white/20 transition-colors shrink-0" @click="copyUrl">
            Copy
          </button>
        </div>
      </div>

      <details class="mt-4 w-full max-w-sm text-left group">
        <summary class="cursor-pointer list-none text-[12px] text-white/60 hover:text-white transition-colors underline decoration-white/30 underline-offset-2">
          How does sharing work?
        </summary>
        <p class="mt-2 text-[12.5px] text-white/75 leading-relaxed bg-white/10 rounded-xl px-3.5 py-3">
          Your whole trip lives inside the link — no account or server needed. It's compressed and encrypted, and the trip part of the link is never sent to any server. Anyone you give the full link to can view the trip and keep planning together. A cut-off or edited link won't open, and each link has an ID so everyone can check they have the latest one.
        </p>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Trip } from '../types/trip'
import { useTripShare } from '../composables/useTripShare'
import { useToasts } from '../composables/useToasts'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  completeTrip: []
}>()

const { shareUrl, shareInfo, isCopied, isSharing, error: shareError, shareTrip, copyToClipboard } = useTripShare()
const { success, error } = useToasts()

const isReady = computed(
  () => props.trip.tripName.trim() !== '' || props.trip.destination.trim() !== ''
)

const heading = computed(() => {
  if (!isReady.value) return 'Your trip is taking shape.'
  if (isCopied.value) return 'Trip shared ✓'
  return 'Ready to share?'
})

const description = computed(() => {
  if (!isReady.value) return 'Complete your trip details to unlock sharing.'
  if (isCopied.value) return 'Trip link copied — send it to your friends.'
  return 'Send your adventure to your crew with one link.'
})

const buttonText = computed(() => {
  if (isSharing.value) return 'Creating link…'
  if (!isReady.value) return 'Complete trip'
  return 'Share trip'
})

const handlePrimary = async () => {
  if (!isReady.value) {
    emit('completeTrip')
    return
  }
  const ok = await shareTrip(props.trip)
  if (ok) {
    const id = shareInfo.value ? ` Link ID ${shareInfo.value.id}.` : ''
    success('Trip link copied', `Send it to your friends — they can open and keep planning.${id}`)
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