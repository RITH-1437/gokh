<template>
  <div class="space-y-4">
    <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-sand-600">
      Contributions
    </p>

    <!-- Crew funding rows -->
    <div v-if="members.length > 0" class="space-y-3">
      <div
        v-for="member in members"
        :key="member.id"
        class="flex items-center gap-3.5 rounded-2xl bg-white border border-stone-200/80 px-4 py-3 transition-all duration-200 hover:border-cambodia-300 hover:shadow-soft"
      >
        <Avatar :name="member.name" :role="member.role" size="sm" />

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[14px] font-bold text-ink truncate">
              {{ member.name }}
              <span v-if="member.role === 'leader'" class="ml-1 text-[11px] font-semibold text-sand-600">Leader</span>
            </span>
            <span class="text-[12px] font-semibold text-ink-mute tnum shrink-0">
              {{ getContributionPercentage(member) }}%
            </span>
          </div>

          <div class="mt-1.5 h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-cambodia-400 to-cambodia-600 transition-[width] duration-500 ease-out"
              :style="{ width: `${getContributionPercentage(member)}%` }"
            />
          </div>
        </div>

        <div class="relative shrink-0">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-ink-mute">
            {{ budget.currency === 'USD' ? '$' : '៛' }}
          </span>
          <input
            :value="getContributionAmount(member)"
            type="text"
            inputmode="decimal"
            :placeholder="placeholderFor(member)"
            class="w-24 pl-7 pr-2 py-2 rounded-xl bg-ivory border border-stone-200 text-[14px] font-bold text-ink tnum focus:outline-none focus:border-cambodia-400 focus:ring-4 focus:ring-cambodia-100 transition-all"
            @input="handleContributionInput(member.id, $event)"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-[13.5px] text-ink-mute">
      Add travelers to split the budget.
    </div>

    <div v-if="contributionWarning" class="mt-3">
      <WarningAlert variant="warning" :message="contributionWarning" dismissible @dismiss="contributionWarning = ''" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Member, Budget, Currency } from '../types/trip'
import { formatCurrency } from '../utils/currency'
import { validateContribution } from '../utils/validation'
import { useToasts } from '../composables/useToasts'
import Avatar from './Avatar.vue'
import WarningAlert from './WarningAlert.vue'

const props = defineProps<{
  members: Member[]
  budget: Budget
  perPersonBudget: number
}>()

const emit = defineEmits<{
  updateContribution: [memberId: string, amount: number, currency: Currency]
}>()

const { error } = useToasts()
const contributionWarning = ref('')

const getContributionAmount = (member: Member): string => {
  const contribution = props.budget.contributions.find(c => c.memberId === member.id)
  if (!contribution) return ''
  return contribution.currency === 'USD'
    ? String(contribution.amount)
    : contribution.amount.toLocaleString()
}

const getContributionPercentage = (member: Member): number => {
  const contribution = props.budget.contributions.find(c => c.memberId === member.id)
  if (!contribution || props.budget.total <= 0) return 0
  const amount = contribution.currency === props.budget.currency
    ? contribution.amount
    : contribution.currency === 'USD'
      ? contribution.amount * 4000
      : contribution.amount / 4000
  return Math.min(Math.round((amount / props.budget.total) * 100), 100)
}

const placeholderFor = (member: Member) => {
  if (props.perPersonBudget > 0) return formatCurrency(props.perPersonBudget, props.budget.currency)
  return '0'
}

const handleContributionInput = (memberId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/,/g, '')
  const numValue = parseFloat(value) || 0

  const validation = validateContribution(numValue, props.members.length, props.budget.total)
  if (validation.errors.length > 0) {
    contributionWarning.value = validation.errors[0] || ''
  } else if (validation.warnings.length > 0) {
    contributionWarning.value = validation.warnings[0] || ''
  } else {
    contributionWarning.value = ''
  }

  emit('updateContribution', memberId, numValue, props.budget.currency)
}
</script>