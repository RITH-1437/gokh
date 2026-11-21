<template>
  <div class="surface !rounded-3xl p-6 sm:p-7 relative overflow-hidden">
    <!-- subtle decorative wash -->
    <div class="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20" style="background: radial-gradient(closest-side, #E2BD76, transparent)" />

    <!-- Top row: label + currency toggle -->
    <div class="relative flex items-center justify-between gap-3 mb-6">
      <span class="text-[11px] font-bold uppercase tracking-[0.18em] text-sand-600">
        Your trip budget
      </span>

      <div class="relative inline-flex p-1 rounded-2xl bg-stone-200/70">
        <div
          class="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow-soft transition-transform duration-200"
          :style="{ transform: activeCurrencyIndex ? 'translateX(100%)' : 'translateX(0)' }"
        />
        <button
          v-for="curr in currencies"
          :key="curr"
          type="button"
          class="relative z-10 flex-1 px-4 sm:px-5 py-1.5 text-[13px] font-bold rounded-xl transition-colors duration-200"
          :class="budget.currency === curr ? 'text-cambodia-700' : 'text-ink-mute hover:text-ink'"
          @click="selectCurrency(curr)"
        >
          {{ curr }}
        </button>
      </div>
    </div>

    <!-- Big amount -->
    <div class="relative flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div class="flex items-baseline gap-1.5 min-w-0">
        <span class="text-3xl sm:text-4xl font-extrabold text-ink/70">{{ symbol }}</span>
        <input
          :value="formattedBudget"
          type="text"
          inputmode="decimal"
          aria-label="Trip budget amount"
          :placeholder="budget.currency === 'USD' ? '100' : '400,000'"
          class="w-full max-w-[300px] bg-transparent text-5xl sm:text-6xl font-extrabold text-ink tnum focus:outline-none border-b-2 border-transparent focus:border-cambodia-300 transition-colors"
          @input="handleBudgetInput"
        />
      </div>
      <div class="text-left sm:text-right">
        <div class="text-[15px] font-bold text-ink-soft">{{ convertedAmount }}</div>
        <div class="text-[12px] text-ink-mute mt-0.5">1 USD = 4,000 KHR</div>
      </div>
    </div>

    <!-- Funding progress -->
    <div class="relative mt-7">
      <div class="flex items-center justify-between text-[13px] font-semibold">
        <span :class="statusTextClass">{{ statusText }}</span>
        <span class="text-ink-mute tnum">{{ progressPercent }}%</span>
      </div>
      <div class="mt-2 h-3 bg-stone-200/80 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-[width] duration-500 ease-out"
          :class="progressBarClass"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
      <div class="mt-2 flex items-center justify-between text-[12.5px] text-ink-mute">
        <span class="tnum">{{ formatCurrency(Math.round(animatedTotal * 100) / 100, budget.currency) }} contributed</span>
        <span v-if="budget.total > 0" class="tnum">of {{ formatCurrency(budget.total, budget.currency) }}</span>
      </div>
    </div>

    <!-- Per person -->
    <div
      v-if="perPersonBudget > 0"
      class="relative mt-5 flex items-center gap-2.5 rounded-2xl bg-sand-50 border border-sand-200/70 px-4 py-3"
    >
      <Emoji3D emoji="👛" size="xs" />
      <span class="text-[13px] text-ink-soft">
        <span class="font-bold text-ink tnum">{{ formatCurrency(perPersonBudget, budget.currency) }}</span>
        per traveler
      </span>
    </div>

    <!-- Validation -->
    <WarningAlert
      v-if="budgetWarning"
      class="relative mt-3"
      variant="warning"
      :message="budgetWarning"
      dismissible
      @dismiss="budgetWarning = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Budget, Currency } from '../types/trip'
import { USD_TO_KHR, formatCurrency, formatNumber, convertCurrency, currencySymbol, parseAmountInput } from '../utils/currency'
import { validateBudget } from '../utils/validation'
import { useAnimatedNumber } from '../composables/useAnimatedNumber'
import Emoji3D from './Emoji3D.vue'
import WarningAlert from './WarningAlert.vue'

const props = defineProps<{
  modelValue: Budget
  totalContributed: number
  isOverBudget: boolean
  perPersonBudget: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Budget]
}>()

const budget = computed(() => props.modelValue)

const currencies: Currency[] = ['USD', 'KHR']
const budgetWarning = ref('')

const { value: animatedTotal, set: setAnimatedTotal } = useAnimatedNumber(450)
watch(() => props.totalContributed, setAnimatedTotal, { immediate: true })

const activeCurrencyIndex = computed(() => (budget.value.currency === 'USD' ? 0 : 1))
const symbol = computed(() => currencySymbol(budget.value.currency))

const formattedBudget = computed(() => formatNumber(budget.value.total, budget.value.currency))

const convertedAmount = computed(() => {
  if (budget.value.currency === 'USD') {
    return formatCurrency(budget.value.total * USD_TO_KHR, 'KHR')
  }
  return formatCurrency(budget.value.total / USD_TO_KHR, 'USD')
})

const progressPercent = computed(() => {
  if (budget.value.total <= 0) return 0
  return Math.min(Math.round((props.totalContributed / budget.value.total) * 100), 100)
})

const statusText = computed(() => {
  if (props.isOverBudget) {
    const over = Math.abs(props.totalContributed - budget.value.total)
    return `⚠ ${formatCurrency(over, budget.value.currency)} over budget`
  }
  if (budget.value.total > 0 && props.totalContributed >= budget.value.total) return '✓ Fully funded'
  if (props.totalContributed > 0) return `${progressPercent.value}% funded`
  return 'Set a budget to get started'
})

const statusTextClass = computed(() => {
  if (props.isOverBudget) return 'text-clay-600'
  if (budget.value.total > 0 && props.totalContributed >= budget.value.total) return 'text-cambodia-700'
  if (props.totalContributed > 0) return 'text-sand-600'
  return 'text-ink-mute'
})

const progressBarClass = computed(() => {
  if (props.isOverBudget) return 'bg-gradient-to-r from-clay-500 to-clay-600'
  if (props.totalContributed >= budget.value.total && budget.value.total > 0) return 'bg-gradient-to-r from-cambodia-500 to-cambodia-600'
  if (props.totalContributed > 0) return 'bg-gradient-to-r from-sand-400 to-sand-500'
  return 'bg-stone-300'
})

const selectCurrency = (currency: Currency) => {
  if (currency === budget.value.currency) return
  const convertedTotal = convertCurrency(budget.value.total, budget.value.currency, currency)
  emit('update:modelValue', {
    ...budget.value,
    currency,
    total: Math.round(convertedTotal * 100) / 100,
    contributions: budget.value.contributions.map(c => ({
      ...c,
      amount: Math.round(convertCurrency(c.amount, c.currency, currency) * 100) / 100,
      currency
    }))
  })
}

const handleBudgetInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const numValue = parseAmountInput(target.value)
  const validation = validateBudget(numValue, budget.value.currency)
  budgetWarning.value = validation.isValid ? validation.warnings[0] || '' : validation.errors[0] || ''
  emit('update:modelValue', { ...budget.value, total: numValue })
}
</script>