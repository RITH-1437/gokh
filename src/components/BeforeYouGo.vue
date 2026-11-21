<template>
  <div class="space-y-5">
    <!-- Shared checklist -->
    <div class="surface !rounded-3xl p-5 sm:p-6">
      <div class="flex items-center justify-between gap-3 mb-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sand-600">Crew checklist</p>
        <span class="text-[12px] font-semibold text-ink-mute tnum">{{ doneCount }} / {{ items.length }} done</span>
      </div>
      <div class="h-1.5 bg-stone-200/80 rounded-full overflow-hidden mb-4">
        <div
          class="h-full rounded-full bg-gradient-to-r from-cambodia-400 to-cambodia-600 transition-[width] duration-500 ease-out"
          :style="{ width: `${Math.round((doneCount / items.length) * 100)}%` }"
        />
      </div>

      <ul class="space-y-2">
        <li v-for="item in items" :key="item.id">
          <label
            class="flex items-start gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-colors duration-200"
            :class="isDone(item.id) ? 'bg-cambodia-50/70 border-cambodia-200' : 'bg-white border-stone-200/80 hover:border-cambodia-300'"
          >
            <input
              type="checkbox"
              class="mt-0.5 h-[18px] w-[18px] flex-none rounded accent-cambodia-600 cursor-pointer"
              :checked="isDone(item.id)"
              @change="emit('toggle', item.id)"
            />
            <span class="min-w-0">
              <span class="block text-[14px] font-bold" :class="isDone(item.id) ? 'text-cambodia-800 line-through decoration-cambodia-300' : 'text-ink'">
                {{ item.label }}
              </span>
              <span class="block text-[12.5px] text-ink-mute leading-snug mt-0.5">{{ item.detail }}</span>
            </span>
          </label>
        </li>
      </ul>
      <p class="mt-3 text-[12px] text-ink-mute">
        Ticks are saved in the trip link, so the whole crew sees what's done.
      </p>
    </div>

    <!-- Practical info -->
    <div class="grid sm:grid-cols-2 gap-3">
      <div v-for="block in info" :key="block.title" class="surface !rounded-2xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base" aria-hidden="true">{{ block.emoji }}</span>
          <span class="font-bold text-ink text-sm">{{ block.title }}</span>
        </div>
        <ul class="space-y-1">
          <li v-for="line in block.lines" :key="line" class="text-[12.5px] text-ink-soft leading-snug">{{ line }}</li>
        </ul>
      </div>
    </div>
    <p class="text-[11.5px] text-ink-mute">
      Visa, entry and safety rules checked {{ checkedOn }}. They change — confirm with official sources before you travel.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PRE_TRIP_CHECKLIST, PRACTICAL_INFO, ESSENTIALS_CHECKED } from '../data/essentials'

const props = defineProps<{
  checklist: string[]
}>()

const emit = defineEmits<{
  toggle: [id: string]
}>()

const items = PRE_TRIP_CHECKLIST
const info = PRACTICAL_INFO
const checkedOn = ESSENTIALS_CHECKED

const isDone = (id: string) => props.checklist.includes(id)
const doneCount = computed(() => items.filter(i => isDone(i.id)).length)
</script>
