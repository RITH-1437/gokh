<template>
  <section class="relative overflow-hidden">
    <!-- Decorative background -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-40"
        style="background: radial-gradient(closest-side, #E2BD76, transparent)"
      />
      <div
        class="absolute top-32 -left-32 w-80 h-80 rounded-full opacity-30"
        style="background: radial-gradient(closest-side, #BAD9C7, transparent)"
      />
      <svg class="absolute inset-x-0 top-6 w-full h-40 opacity-[0.16] hidden lg:block" viewBox="0 0 800 100" preserveAspectRatio="none">
        <path d="M0 60 C 140 20, 240 90, 380 50 S 640 20, 800 55" fill="none" stroke="#2C6B4C" stroke-width="2" stroke-dasharray="2 10" stroke-linecap="round" />
      </svg>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6">
      <div class="grid lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-4 items-center">
        <!-- Copy -->
        <div class="text-center lg:text-left">
          <div class="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/80 border border-sand-200/70 px-4 py-1.5 text-[13px] font-semibold text-ink-soft shadow-soft" style="animation-delay: 60ms">
            <span class="text-[15px]">🇰🇭</span>
            Explore Cambodia together
          </div>

          <h1 class="animate-fade-up mt-5 text-[40px] leading-[1.05] sm:text-6xl font-extrabold tracking-tight text-ink" style="animation-delay: 140ms">
            Plan your
            <span class="text-cambodia-600">Cambodia</span>
            adventure.
          </h1>

          <p class="animate-fade-up mt-4 text-base sm:text-lg text-ink-soft leading-relaxed max-w-md mx-auto lg:mx-0" style="animation-delay: 220ms">
            Build the trip. Bring your crew.
            Share the journey with one link.
          </p>

          <div class="animate-fade-up mt-7 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3" style="animation-delay: 300ms">
            <button class="btn-primary w-full sm:w-auto text-base" @click="emit('start')">
              <span>Start planning</span>
              <Icon name="arrow-right" :size="18" />
            </button>
            <button class="btn-ghost w-full sm:w-auto" @click="emit('preview')">
              <Icon name="sparkles" :size="17" class="text-sand-500" />
              View trip card
            </button>
          </div>

          <!-- Compact emoji row (mobile) -->
          <div class="animate-fade-up mt-8 flex justify-center lg:hidden" style="animation-delay: 380ms">
            <div class="flex -space-x-2">
              <Emoji3D emoji="🛕" size="sm" shape="tile" />
              <Emoji3D emoji="🛵" size="sm" shape="tile" float :float-delay="400" />
              <Emoji3D emoji="📍" size="sm" shape="tile" float :float-delay="900" />
              <Emoji3D emoji="🌴" size="sm" shape="tile" />
            </div>
          </div>
        </div>

        <!-- 3D travel scene (desktop) -->
        <div class="hidden lg:block relative h-[360px]" aria-hidden="true">
          <div class="animate-pop-in absolute inset-0 m-auto flex items-center justify-center" style="animation-delay: 320ms">
            <Emoji3D emoji="🛕" size="xl" float />
          </div>
          <div class="animate-pop-in absolute left-[6%] top-[12%]" style="animation-delay: 400ms">
            <Emoji3D emoji="📍" size="sm" float :float-delay="500" />
          </div>
          <div class="animate-pop-in absolute right-[8%] top-[18%]" style="animation-delay: 460ms">
            <Emoji3D emoji="🛵" size="md" float :float-delay="1200" />
          </div>
          <div class="animate-pop-in absolute left-[10%] bottom-[6%]" style="animation-delay: 520ms">
            <Emoji3D emoji="🏖️" size="sm" shape="tile" float :float-delay="1800" />
          </div>
          <div class="animate-pop-in absolute right-[14%] bottom-[10%]" style="animation-delay: 580ms">
            <Emoji3D emoji="🌴" size="md" shape="tile" float :float-delay="700" />
          </div>
          <div class="animate-pop-in absolute right-[30%] top-[4%]" style="animation-delay: 640ms">
            <Emoji3D emoji="🥥" size="xs" float :float-delay="2200" />
          </div>
          <div class="animate-pop-in absolute left-[24%] bottom-[2%]" style="animation-delay: 700ms">
            <Emoji3D emoji="🏍️" size="sm" float :float-delay="1500" />
          </div>
        </div>
      </div>

      <!-- Live trip preview strip -->
      <div class="animate-fade-up mt-10 lg:mt-12" style="animation-delay: 400ms">
        <div class="surface !rounded-2xl px-5 py-4">
          <div class="flex flex-wrap items-center gap-x-5 gap-y-2.5">
            <span class="text-[11px] font-bold tracking-[0.18em] uppercase text-sand-600">
              Your trip
            </span>

            <template v-if="hasAnyDetails">
              <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <span class="text-base">📍</span>
                <span v-if="trip.destination">{{ trip.destination }}</span>
                <span v-else class="text-ink-mute">Choose a destination</span>
              </span>

              <span v-if="trip.startDate && trip.endDate" class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink tnum">
                <span class="text-base">🗓️</span>
                {{ formatTripRange(trip.startDate, trip.endDate) }}
              </span>

              <span v-if="trip.members.length" class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                <span class="text-base">👥</span>
                {{ trip.members.length }} traveler{{ trip.members.length > 1 ? 's' : '' }}
              </span>

              <span v-if="trip.budget.total > 0" class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink tnum">
                <span class="text-base">💰</span>
                {{ formatCurrency(trip.budget.total, trip.budget.currency) }}
              </span>
            </template>

            <span v-else class="text-sm text-ink-mute">
              Ready when you are — pick a destination to begin.
            </span>

            <span v-if="loadedFromUrl" class="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-cambodia-700 bg-cambodia-50 border border-cambodia-200/70 rounded-full px-3 py-1">
              <Icon name="link" :size="14" />
              Shared trip
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Trip } from '../types/trip'
import { formatTripRange } from '../utils/dates'
import { formatCurrency } from '../utils/currency'
import Emoji3D from './Emoji3D.vue'
import Icon from './icons/Icon.vue'

const props = defineProps<{
  trip: Trip
  loadedFromUrl?: boolean
}>()

const emit = defineEmits<{
  start: []
  preview: []
}>()

const hasAnyDetails = computed(
  () =>
    !!props.trip.destination ||
    (!!props.trip.startDate && !!props.trip.endDate) ||
    props.trip.members.length > 0 ||
    props.trip.budget.total > 0
)
</script>