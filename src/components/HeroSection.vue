<template>
  <section class="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5">
    <div class="relative isolate overflow-hidden rounded-[28px] sm:rounded-[36px] bg-cambodia-900 text-white shadow-lift min-h-[560px] lg:min-h-[600px] flex">
      <!-- Destination photo (crossfades when the destination changes) -->
      <Transition
        enter-active-class="transition-opacity duration-700 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-700 ease-out absolute inset-0"
        leave-to-class="opacity-0"
      >
        <img
          :key="heroImage"
          :src="heroImage"
          alt=""
          aria-hidden="true"
          fetchpriority="high"
          decoding="async"
          class="absolute inset-0 -z-10 h-full w-full object-cover animate-ken-burns"
          @error="failedImage = heroImage"
        />
      </Transition>

      <!-- Legibility overlays -->
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/20 lg:bg-gradient-to-r lg:from-black/75 lg:via-black/40 lg:to-black/5" aria-hidden="true" />
      <div class="absolute inset-x-0 bottom-0 h-40 -z-10 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />

      <div class="relative w-full px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 grid lg:grid-cols-[1.15fr_.85fr] gap-10 lg:gap-12 items-end lg:items-center">
        <!-- Copy -->
        <div class="max-w-xl">
          <div class="animate-fade-up glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold text-white/95" style="animation-delay: 60ms">
            Explore Cambodia together
          </div>

          <h1 class="animate-fade-up mt-5 text-[44px] leading-[1.02] sm:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,.35)]" style="animation-delay: 140ms">
            Plan your
            <span class="text-sand-300">Cambodia</span>
            adventure.
          </h1>

          <p class="animate-fade-up mt-5 text-base sm:text-lg text-white/85 leading-relaxed max-w-md" style="animation-delay: 220ms">
            Temples at sunrise, islands at sunset. Build the trip, bring your crew,
            and share the whole plan with one link.
          </p>

          <div class="animate-fade-up mt-8 flex flex-col sm:flex-row gap-3" style="animation-delay: 300ms">
            <button class="btn-gold w-full sm:w-auto !h-[52px] !px-7 text-base" @click="emit('start')">
              <span>Start planning</span>
              <Icon name="arrow-right" :size="18" />
            </button>
            <button
              class="glass inline-flex items-center justify-center gap-2 h-[52px] px-6 rounded-2xl font-semibold text-[15px] text-white hover:bg-white/20 transition-colors duration-200 focus-ring w-full sm:w-auto"
              @click="emit('preview')"
            >
              View trip card
            </button>
          </div>

          <div class="animate-fade-up mt-8 flex items-center gap-2 text-[12.5px] text-white/70" style="animation-delay: 380ms">
            <span>{{ heroCaption }}</span>
          </div>
        </div>

        <!-- Live trip card -->
        <div class="animate-fade-up lg:justify-self-end w-full lg:max-w-sm" style="animation-delay: 420ms">
          <div class="glass-strong rounded-3xl p-5 sm:p-6">
            <div class="flex items-center justify-between gap-3">
              <span class="text-[11px] font-bold tracking-[0.2em] uppercase text-sand-200">Your trip</span>
              <span v-if="loadedFromUrl" class="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-white/15 rounded-full px-2.5 py-1">
                Shared
              </span>
            </div>

            <div class="mt-2 text-2xl font-extrabold tracking-tight leading-tight truncate">
              {{ trip.tripName || trip.destination || 'Your next adventure' }}
            </div>

            <ul v-if="hasAnyDetails" class="mt-4 grid grid-cols-2 gap-2.5">
              <li class="rounded-2xl bg-white/10 px-3.5 py-3">
                <div class="text-[11px] uppercase tracking-wider text-white/60">Where</div>
                <div class="mt-0.5 text-[14px] font-bold truncate">{{ trip.destination || '—' }}</div>
              </li>
              <li class="rounded-2xl bg-white/10 px-3.5 py-3">
                <div class="text-[11px] uppercase tracking-wider text-white/60">When</div>
                <div class="mt-0.5 text-[14px] font-bold tnum leading-snug">
                  {{ trip.startDate && trip.endDate ? formatTripRange(trip.startDate, trip.endDate) : '—' }}
                </div>
              </li>
              <li class="rounded-2xl bg-white/10 px-3.5 py-3">
                <div class="text-[11px] uppercase tracking-wider text-white/60">Crew</div>
                <div class="mt-0.5 text-[14px] font-bold">
                  {{ trip.members.length ? `${trip.members.length} traveler${trip.members.length > 1 ? 's' : ''}` : '—' }}
                </div>
              </li>
              <li class="rounded-2xl bg-white/10 px-3.5 py-3">
                <div class="text-[11px] uppercase tracking-wider text-white/60">Budget</div>
                <div class="mt-0.5 text-[14px] font-bold tnum truncate">
                  {{ trip.budget.total > 0 ? formatCurrency(trip.budget.total, trip.budget.currency) : '—' }}
                </div>
              </li>
            </ul>
            <p v-else class="mt-3 text-[14px] text-white/75 leading-relaxed">
              Ready when you are — pick a destination and your plan starts filling in here.
            </p>
          </div>
        </div>
      </div>

      <!-- Photo credit for licensed remote photos -->
      <a
        v-if="heroCredit"
        :href="heroCredit.source"
        target="_blank"
        rel="noopener noreferrer"
        class="absolute bottom-3 right-4 text-[10.5px] text-white/55 hover:text-white/90 transition-colors"
      >
        Photo: {{ heroCredit.author }} · {{ heroCredit.license }}
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Trip } from '../types/trip'
import { formatTripRange } from '../utils/dates'
import { formatCurrency } from '../utils/currency'
import { findDestination } from '../data/destinations'
import defaultHero from '../assets/images/place/angkor-wat.webp'
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

// The hero shows the chosen destination's photo; Angkor Wat until one is picked
// or if a remote photo fails to load.
const failedImage = ref('')
const dest = computed(() => findDestination(props.trip.destination))
const usingDestPhoto = computed(() => !!dest.value?.image && dest.value.image !== failedImage.value)
const heroImage = computed(() => (usingDestPhoto.value ? dest.value!.image! : defaultHero))
const heroCredit = computed(() => (usingDestPhoto.value ? dest.value?.imageCredit : undefined))
const heroCaption = computed(() =>
  usingDestPhoto.value && dest.value
    ? `${dest.value.name} · ${dest.value.tagline ?? dest.value.region}`
    : 'Angkor Wat · Siem Reap'
)
</script>
