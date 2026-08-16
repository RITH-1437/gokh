<template>
  <div class="space-y-5">
    <!-- Weather context note (friendly, not an error) -->
    <div v-if="weatherError" class="animate-fade-in flex items-start gap-3 rounded-2xl bg-sand-50 border border-sand-200/70 px-4 py-3.5">
      <Emoji3D emoji="🌤️" size="xs" />
      <div class="text-[13.5px] text-ink-soft leading-snug">
        <span class="font-bold text-ink">Weather preview.</span>
        Forecasts are available for trips within 14 days of today — check back closer to your dates. The trip plan keeps working fine.
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="itinerary.length === 0" class="surface !rounded-3xl px-6 py-10 flex flex-col items-center text-center">
      <Emoji3D emoji="🗺️" size="xl" float />
      <p class="mt-5 font-extrabold text-ink text-lg">Your adventure is waiting.</p>
      <p class="text-sm text-ink-mute mt-1 max-w-sm">
        Choose your dates to start building your itinerary.
      </p>
      <button class="btn-primary mt-5" @click="emit('choose-dates')">
        Choose dates
        <Icon name="arrow-right" :size="16" />
      </button>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <div class="absolute left-[22px] sm:left-[31px] top-4 bottom-4 w-[2px] rounded-full bg-gradient-to-b from-cambodia-300/70 via-stone-200 to-stone-200" />

      <div v-for="(day, dayIndex) in itinerary" :key="day.dayNumber" class="relative pb-9">
        <!-- Day node -->
        <div class="relative flex items-center gap-2.5 sm:gap-4">
          <div class="relative z-10 flex-none">
            <div
              :class="[
                'w-11 h-11 sm:w-[62px] sm:h-[62px] rounded-2xl flex flex-col items-center justify-center shadow-glow border transition-colors duration-300',
                hasActivities(day)
                  ? 'bg-gradient-to-b from-cambodia-500 to-cambodia-700 border-cambodia-700 text-white ring-4 ring-cambodia-500/10'
                  : 'bg-white border-stone-200 text-ink'
              ]"
            >
              <span class="text-[8px] sm:text-[10px] font-bold tracking-[0.14em]">DAY {{ String(day.dayNumber).padStart(2, '0') }}</span>
              <span class="text-lg sm:text-2xl font-extrabold leading-none tnum">{{ dayDate(day.date).day }}</span>
              <span class="text-[8px] sm:text-[10px] font-bold opacity-70">{{ dayDate(day.date).month }}</span>
            </div>
          </div>

          <div class="min-w-0">
            <div class="font-extrabold text-ink text-base sm:text-xl leading-tight">
              {{ formatDate(day.date) }}
            </div>
            <div class="text-[12px] sm:text-[13px] text-ink-mute">
              {{ dayName(day.date) }}
            </div>
          </div>

          <div class="ml-auto flex items-center gap-2">
            <!-- Stop count chip -->
            <span v-if="day.activities.length" class="chip !pointer-events-none !bg-white hidden sm:inline-flex">
              <Icon name="flag" :size="12" class="text-sand-600" />
              {{ day.activities.length }} stop{{ day.activities.length > 1 ? 's' : '' }}
            </span>
            <!-- Weather chip for this day -->
            <div v-if="weatherLoading" class="skeleton w-14 h-7 sm:w-20 sm:h-8" />
            <div
              v-else-if="dayWeather(day.date)"
              class="chip !pointer-events-none !bg-white whitespace-nowrap"
              :title="`${dayWeather(day.date)!.temperature}°C · ${dayWeather(day.date)!.rainChance}% rain`"
            >
              <span class="text-[13px] sm:text-[14px]">{{ weatherEmoji(dayWeather(day.date)!.weatherCode) }}</span>
              <span class="tnum text-[12px] sm:text-[13px]">{{ dayWeather(day.date)!.temperature }}°C</span>
            </div>
          </div>
        </div>

        <!-- Activities -->
        <div class="mt-4 space-y-2.5 sm:pl-[78px]">
          <div
            v-for="(activity, actIndex) in day.activities"
            :key="activity.id"
            class="relative overflow-hidden surface !rounded-2xl border border-stone-200/60 p-4 transition-all duration-200 hover:shadow-lift animate-slide-down"
          >
            <div
              v-if="activity.startTime"
              class="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-cambodia-500 to-cambodia-700"
            />
            <!-- Read mode -->
            <div v-if="!isEditing(dayIndex, actIndex)" class="flex items-start gap-3">
              <div class="flex-none pt-0.5">
                <div
                  :class="[
                    'w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-extrabold tnum',
                    hasActivities(day) ? 'bg-cambodia-600 text-white shadow-soft' : 'bg-stone-100 text-ink-mute'
                  ]"
                >
                  {{ actIndex + 1 }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-ink text-[15px] leading-snug break-words">{{ activity.name }}</h4>

                <div v-if="activity.startTime || activity.endTime" class="mt-1.5 flex flex-wrap gap-2">
                  <span v-if="activity.startTime && activity.endTime" class="chip !bg-ivory tnum text-[11.5px] whitespace-nowrap">
                    <Icon name="clock" :size="12" class="text-cambodia-700" />
                    {{ activity.startTime }}–{{ activity.endTime }}
                    <span class="text-ink-mute">· {{ timeDuration(activity.startTime, activity.endTime) }}</span>
                  </span>
                  <span v-else-if="activity.startTime" class="chip !bg-ivory tnum text-[11.5px] whitespace-nowrap">
                    <Icon name="clock" :size="12" class="text-cambodia-700" />
                    {{ activity.startTime }}
                  </span>
                </div>

                <p v-if="activity.description" class="text-[13.5px] text-ink-soft mt-1.5 leading-relaxed">
                  {{ activity.description }}
                </p>

                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <!-- Activity weather -->
                  <span v-if="dayWeather(day.date)" class="chip !pointer-events-none !bg-ivory whitespace-nowrap">
                    {{ weatherEmoji(dayWeather(day.date)!.weatherCode) }}
                    {{ dayWeather(day.date)!.temperature }}°C
                    · {{ dayWeather(day.date)!.rainChance }}% rain
                  </span>

                  <button
                    class="chip group whitespace-nowrap"
                    @click="emit('directions', activity.name || destination)"
                  >
                    <Icon name="navigation-2" :size="13" class="text-cambodia-600" />
                    Directions
                    <Icon name="external-link" :size="12" class="opacity-40 group-hover:opacity-80 transition-opacity" />
                  </button>
                </div>
              </div>

              <div class="flex flex-col gap-1 shrink-0">
                <button
                  class="p-1.5 rounded-lg text-ink-mute hover:text-cambodia-700 hover:bg-cambodia-50 transition-colors"
                  title="Edit activity"
                  aria-label="Edit activity"
                  @click="startEdit(dayIndex, actIndex)"
                >
                  <Icon name="edit" :size="14" />
                </button>
                <button
                  class="p-1.5 rounded-lg text-ink-mute hover:text-clay-600 hover:bg-clay-100 transition-colors"
                  title="Remove activity"
                  aria-label="Remove activity"
                  @click="removeActivity(dayIndex, actIndex)"
                >
                  <Icon name="trash-2" :size="14" />
                </button>
              </div>
            </div>

            <!-- Edit mode -->
            <div v-else class="space-y-3 animate-fade-in">
              <input
                v-model="editForm.name"
                type="text"
                placeholder="Activity name"
                class="field !h-11"
              />
              <div class="flex gap-2">
                <input v-model="editForm.startTime" type="time" class="field !h-11 flex-1" />
                <input v-model="editForm.endTime" type="time" class="field !h-11 flex-1" />
              </div>
              <textarea
                v-model="editForm.description"
                rows="2"
                placeholder="Notes (optional)"
                class="field !h-auto py-3 resize-none"
              />
              <div class="flex gap-2 justify-end">
                <button class="btn-ghost !h-10 !px-4 text-sm" @click="cancelEdit">Cancel</button>
                <button class="btn-primary !h-10 !px-5 text-sm" @click="saveEdit(dayIndex, actIndex)">
                  Save
                </button>
              </div>
            </div>
          </div>

          <!-- Add draft panel -->
          <div v-if="draftDay === dayIndex" class="animate-slide-down surface !rounded-2xl p-4 space-y-3">
            <input
              v-model="draft.name"
              type="text"
              placeholder="What are you doing?"
              class="field !h-11"
              autofocus
              @keyup.enter="saveDraft(dayIndex)"
            />
            <div class="flex gap-2">
              <input v-model="draft.startTime" type="time" class="field !h-11 flex-1" />
              <input v-model="draft.endTime" type="time" class="field !h-11 flex-1" />
            </div>
            <textarea
              v-model="draft.description"
              rows="2"
              placeholder="Notes (optional)"
              class="field !h-auto py-3 resize-none"
            />
            <p v-if="draftError" class="text-[13px] text-clay-600 animate-fade-in">{{ draftError }}</p>
            <div class="flex gap-2 justify-end">
              <button class="btn-ghost !h-10 !px-4 text-sm" @click="cancelDraft">Cancel</button>
              <button class="btn-primary !h-10 !px-5 text-sm" @click="saveDraft(dayIndex)">
                Add to the plan
              </button>
            </div>
          </div>

          <!-- Add / suggest -->
          <div v-if="draftDay !== dayIndex" class="pt-1">
            <button
              v-if="day.activities.length === 0"
              class="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 px-4 py-3 text-[13.5px] font-semibold text-ink-mute hover:border-cambodia-400 hover:text-cambodia-700 transition-all duration-200 focus-ring active:scale-[.98]"
              @click="openDraft(dayIndex)"
            >
              <Icon name="plus" :size="15" />
              Add your first activity
            </button>
            <button
              v-else
              class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold text-cambodia-700 bg-cambodia-50 border border-cambodia-200/70 hover:bg-cambodia-100 transition-colors focus-ring active:scale-[.98]"
              @click="openDraft(dayIndex)"
            >
              <Icon name="plus" :size="14" />
              Add activity
            </button>
          </div>

          <!-- Suggestions for empty days -->
          <div v-if="day.activities.length === 0 && suggestions.length > 0 && draftDay !== dayIndex" class="flex flex-wrap gap-2 pt-1">
            <button
              v-for="suggestion in suggestions.slice(0, 6)"
              :key="suggestion"
              class="chip"
              @click="addSuggested(dayIndex, suggestion)"
            >
              ✦ {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { ItineraryDay, Activity, WeatherDay } from '../types/trip'
import { formatDate, parseISODate } from '../utils/dates'
import { getSuggestionsForDestination } from '../data/activities'
import Emoji3D from './Emoji3D.vue'
import Icon from './icons/Icon.vue'

interface NewActivity {
  name: string
  startTime?: string
  endTime?: string
  description?: string
}

const props = defineProps<{
  itinerary: ItineraryDay[]
  destination: string
  weather: WeatherDay[]
  weatherLoading: boolean
  weatherError: string | null
}>()

const emit = defineEmits<{
  addActivity: [dayIndex: number, activity: NewActivity]
  updateActivity: [dayIndex: number, actIndex: number, field: keyof Activity, value: string]
  removeActivity: [dayIndex: number, actIndex: number]
  directions: [location: string]
  chooseDates: []
}>()

const suggestions = computed(() => getSuggestionsForDestination(props.destination))

const hasActivities = (day: ItineraryDay) => day.activities.length > 0

const dayDate = (date: string) => {
  const d = parseISODate(date)
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  }
}

const dayName = (date: string) => parseISODate(date).toLocaleDateString('en-US', { weekday: 'long' })

const dayWeather = (date: string): WeatherDay | undefined =>
  props.weather.find(w => w.date === date)

const timeDuration = (start: string, end: string): string => {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins < 0) mins += 24 * 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

const weatherEmoji = (code: number): string => {
  if (code === 0) return '☀️'
  if (code <= 3) return '🌤️'
  if (code <= 49) return '🌫️'
  if (code <= 69) return '🌦️'
  if (code <= 79) return '❄️'
  if (code <= 99) return '⛈️'
  return '🌤️'
}

// Edit state
const editing = ref<{ day: number; act: number } | null>(null)
const editForm = reactive({ name: '', startTime: '', endTime: '', description: '' })

const isEditing = (dayIndex: number, actIndex: number) =>
  editing.value?.day === dayIndex && editing.value?.act === actIndex

const startEdit = (dayIndex: number, actIndex: number) => {
  const activity = props.itinerary[dayIndex]?.activities[actIndex]
  if (!activity) return
  editForm.name = activity.name
  editForm.startTime = activity.startTime || ''
  editForm.endTime = activity.endTime || ''
  editForm.description = activity.description || ''
  editing.value = { day: dayIndex, act: actIndex }
}

const saveEdit = (dayIndex: number, actIndex: number) => {
  if (!editing.value) return
  emit('updateActivity', dayIndex, actIndex, 'name', editForm.name)
  emit('updateActivity', dayIndex, actIndex, 'startTime', editForm.startTime)
  emit('updateActivity', dayIndex, actIndex, 'endTime', editForm.endTime)
  emit('updateActivity', dayIndex, actIndex, 'description', editForm.description)
  editing.value = null
}

const cancelEdit = () => {
  editing.value = null
}

// Draft state
const draftDay = ref<number | null>(null)
const draft = reactive({ name: '', startTime: '', endTime: '', description: '' })
const draftError = ref('')

const openDraft = (dayIndex: number) => {
  draftDay.value = dayIndex
  draft.name = ''
  draft.startTime = ''
  draft.endTime = ''
  draft.description = ''
  draftError.value = ''
}

const cancelDraft = () => {
  draftDay.value = null
  draftError.value = ''
}

const saveDraft = (dayIndex: number) => {
  const name = draft.name.trim()
  if (!name) {
    draftError.value = 'Give this activity a name first.'
    return
  }
  emit('addActivity', dayIndex, {
    name,
    startTime: draft.startTime,
    endTime: draft.endTime,
    description: draft.description.trim()
  })
  cancelDraft()
}

const addSuggested = (dayIndex: number, name: string) => {
  emit('addActivity', dayIndex, { name })
}

const removeActivity = (dayIndex: number, actIndex: number) => {
  emit('removeActivity', dayIndex, actIndex)
}
</script>